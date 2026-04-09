from rest_framework.permissions import BasePermission

class IsStaff(BasePermission):
    message = 'You do not have access to this resource!'

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_active and request.user.is_staff
        )