"""Compatibility loader for the established CEO extensions plus enterprise integrations."""
try:
    from . import arak_extensions_core  # noqa: F401
except ImportError:
    import arak_extensions_core  # noqa: F401

try:
    from . import odoo_routes  # noqa: F401
except ImportError:
    import odoo_routes  # noqa: F401
