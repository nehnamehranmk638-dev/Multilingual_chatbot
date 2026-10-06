from functools import wraps
from rest_framework.response import Response
from decouple import config

def require_admin(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if request.method == 'OPTIONS':
            return view_func(request, *args, **kwargs)

        admin_pass = str(config("ADMIN_PASSWORD", default="admin123")).strip()
        
        # Check headers case-insensitively via request.headers or request.META
        provided_pass = request.headers.get("X-Admin-Password") or request.headers.get("x-admin-password") or request.META.get("HTTP_X_ADMIN_PASSWORD")
        if provided_pass:
            provided_pass = str(provided_pass).strip()
        
        if not provided_pass or provided_pass != admin_pass:
            print(f"[AdminAuth] Auth Failed. Provided: '{provided_pass}', Expected: '{admin_pass}'")
            return Response({"error": "Unauthorized"}, status=401)
            
        return view_func(request, *args, **kwargs)
    return _wrapped_view
