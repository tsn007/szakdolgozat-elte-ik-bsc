from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ['email', 'first_name', 'last_name']
    list_display = ['email', 'first_name', 'last_name', 'is_staff', 'is_active', 'is_superuser']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'refresh_token')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

    search_fields = ['email', 'first_name', 'last_name']
    
    readonly_fields = ['refresh_token', 'last_login']

    def save_model(self, request, obj, form, change):
        if not change:
            obj.last_login = None
        
        super().save_model(request, obj, form, change)