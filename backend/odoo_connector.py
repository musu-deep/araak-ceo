"""Version-aware Odoo connector for ARAAK CEO OFFICE 360.

Credentials remain server-side. Supports Odoo 19+ JSON-2 and Odoo 14-18 XML-RPC.
"""
from __future__ import annotations

import asyncio
import json
import os
import xmlrpc.client
from dataclasses import asdict, dataclass
from typing import Any, Iterable

import requests


class OdooConnectorError(RuntimeError):
    pass


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_json(name: str, default: Any) -> Any:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return default


@dataclass(frozen=True)
class OdooConfig:
    enabled: bool
    url: str
    database: str
    username: str
    api_key: str
    protocol: str
    timeout: int
    read_only: bool

    @classmethod
    def from_env(cls) -> "OdooConfig":
        protocol = os.getenv("ODOO_PROTOCOL", "auto").strip().lower()
        if protocol not in {"auto", "json2", "xmlrpc"}:
            protocol = "auto"
        return cls(
            enabled=_env_bool("ODOO_ENABLED", False),
            url=os.getenv("ODOO_URL", "").strip().rstrip("/"),
            database=os.getenv("ODOO_DATABASE", "").strip(),
            username=os.getenv("ODOO_USERNAME", "").strip(),
            api_key=os.getenv("ODOO_API_KEY", "").strip(),
            protocol=protocol,
            timeout=max(3, int(os.getenv("ODOO_TIMEOUT", "20"))),
            read_only=_env_bool("ODOO_READ_ONLY", True),
        )

    @property
    def configured(self) -> bool:
        if not self.enabled or not self.url or not self.api_key:
            return False
        if self.protocol == "xmlrpc":
            return bool(self.database and self.username)
        return True

    def public_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data.pop("api_key", None)
        data["configured"] = self.configured
        data["has_api_key"] = bool(self.api_key)
        return data


class OdooConnector:
    def __init__(self, config: OdooConfig | None = None):
        self.config = config or OdooConfig.from_env()
        self._version_cache: dict[str, Any] | None = None
        self._field_cache: dict[str, set[str]] = {}
        self._uid: int | None = None

    def _require_configured(self) -> None:
        if not self.config.configured:
            raise OdooConnectorError("إعدادات Odoo غير مكتملة")

    def _version_sync(self) -> dict[str, Any]:
        response = requests.get(f"{self.config.url}/web/version", timeout=self.config.timeout)
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            raise OdooConnectorError("استجابة إصدار Odoo غير صالحة")
        return payload

    async def version(self, refresh: bool = False) -> dict[str, Any]:
        if self._version_cache is not None and not refresh:
            return self._version_cache
        self._require_configured()
        self._version_cache = await asyncio.to_thread(self._version_sync)
        return self._version_cache

    def _protocol_candidates(self) -> list[str]:
        if self.config.protocol != "auto":
            return [self.config.protocol]
        try:
            version = self._version_cache or self._version_sync()
            info = version.get("version_info") or version.get("server_version_info") or []
            major = int(info[0]) if info else int(str(version.get("version") or version.get("server_version") or "0").split(".")[0])
            return ["json2", "xmlrpc"] if major >= 19 else ["xmlrpc", "json2"]
        except Exception:
            return ["json2", "xmlrpc"]

    def _json2_call(self, model: str, method: str, body: dict[str, Any]) -> Any:
        headers = {
            "Authorization": f"bearer {self.config.api_key}",
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "ARAAK-CEO-Odoo-Connector/1.0",
        }
        if self.config.database:
            headers["X-Odoo-Database"] = self.config.database
        response = requests.post(
            f"{self.config.url}/json/2/{model}/{method}",
            headers=headers,
            json=body,
            timeout=self.config.timeout,
        )
        response.raise_for_status()
        payload = response.json()
        if isinstance(payload, dict) and payload.get("error"):
            raise OdooConnectorError(str(payload["error"]))
        return payload

    def _xmlrpc_uid(self) -> int:
        if self._uid:
            return self._uid
        if not self.config.database or not self.config.username:
            raise OdooConnectorError("يتطلب XML-RPC اسم قاعدة البيانات واسم مستخدم Odoo")
        common = xmlrpc.client.ServerProxy(f"{self.config.url}/xmlrpc/2/common", allow_none=True)
        uid = common.authenticate(self.config.database, self.config.username, self.config.api_key, {})
        if not uid:
            raise OdooConnectorError("رفض Odoo بيانات المصادقة")
        self._uid = int(uid)
        return self._uid

    def _xmlrpc_call(self, model: str, method: str, args: list[Any], kwargs: dict[str, Any]) -> Any:
        uid = self._xmlrpc_uid()
        models = xmlrpc.client.ServerProxy(f"{self.config.url}/xmlrpc/2/object", allow_none=True)
        return models.execute_kw(
            self.config.database,
            uid,
            self.config.api_key,
            model,
            method,
            args,
            kwargs,
        )

    @staticmethod
    def _json2_body(method: str, args: list[Any], kwargs: dict[str, Any]) -> dict[str, Any]:
        body = dict(kwargs)
        if method == "search_read":
            body["domain"] = args[0] if args else []
        elif method == "create":
            body["vals_list"] = args[0] if args else []
        elif method in {"read", "unlink"}:
            body["ids"] = args[0] if args else []
        elif method == "write":
            body["ids"] = args[0] if args else []
            body["vals"] = args[1] if len(args) > 1 else {}
        return body

    def _call_model_sync(self, model: str, method: str, args: list[Any], kwargs: dict[str, Any]) -> Any:
        self._require_configured()
        errors: list[str] = []
        for protocol in self._protocol_candidates():
            try:
                if protocol == "json2":
                    return self._json2_call(model, method, self._json2_body(method, args, kwargs))
                return self._xmlrpc_call(model, method, args, kwargs)
            except Exception as exc:
                errors.append(f"{protocol}: {exc}")
        raise OdooConnectorError("؛ ".join(errors) or "فشل استدعاء Odoo")

    def _resolve_working_protocol_sync(self) -> str:
        errors: list[str] = []
        for protocol in self._protocol_candidates():
            try:
                if protocol == "json2":
                    self._json2_call("res.users", "context_get", {})
                else:
                    self._xmlrpc_uid()
                return protocol
            except Exception as exc:
                errors.append(f"{protocol}: {exc}")
        raise OdooConnectorError("؛ ".join(errors) or "لا يوجد بروتوكول Odoo متاح")

    async def status(self, check: bool = False) -> dict[str, Any]:
        result = {
            "provider": "odoo",
            **self.config.public_dict(),
            "connected": False,
            "resolved_protocol": None,
            "version": None,
            "message": "بيئة Odoo غير مفعلة أو لم تكتمل إعداداتها.",
        }
        if not self.config.configured:
            return result
        if not check:
            result["message"] = "إعدادات Odoo مكتملة؛ استخدم اختبار الاتصال للتحقق الفعلي."
            return result
        try:
            version = await self.version(refresh=True)
            protocol = await asyncio.to_thread(self._resolve_working_protocol_sync)
            result.update(
                connected=True,
                resolved_protocol=protocol,
                version=version.get("version") or version.get("server_version"),
                version_info=version.get("version_info") or version.get("server_version_info"),
                message="تم الاتصال ببيئة Odoo بنجاح.",
            )
        except Exception as exc:
            result["message"] = f"تعذر الاتصال بـ Odoo: {str(exc)[:240]}"
        return result

    def _fields_sync(self, model: str) -> set[str]:
        payload = self._call_model_sync(model, "fields_get", [], {"attributes": ["string", "type"]})
        if not isinstance(payload, dict):
            raise OdooConnectorError(f"تعذر قراءة حقول النموذج {model}")
        return set(payload.keys())

    async def _fields(self, model: str) -> set[str]:
        if model not in self._field_cache:
            self._field_cache[model] = await asyncio.to_thread(self._fields_sync, model)
        return self._field_cache[model]

    async def compatible_search_read(
        self,
        model: str,
        domain: list[Any],
        requested_fields: Iterable[str],
        limit: int = 500,
        order: str = "id desc",
    ) -> list[dict[str, Any]]:
        available = await self._fields(model)
        fields = list(dict.fromkeys(field for field in requested_fields if field and field in available))
        payload = await asyncio.to_thread(
            self._call_model_sync,
            model,
            "search_read",
            [domain],
            {"fields": fields, "limit": limit, "order": order},
        )
        if not isinstance(payload, list):
            raise OdooConnectorError(f"استجابة {model}.search_read غير صالحة")
        return [item for item in payload if isinstance(item, dict)]

    async def call(self, model: str, method: str, args: list[Any] | None = None, kwargs: dict[str, Any] | None = None) -> Any:
        return await asyncio.to_thread(self._call_model_sync, model, method, args or [], kwargs or {})


_CONNECTOR: OdooConnector | None = None


def get_odoo_connector(refresh: bool = False) -> OdooConnector:
    global _CONNECTOR
    if _CONNECTOR is None or refresh:
        _CONNECTOR = OdooConnector()
    return _CONNECTOR
