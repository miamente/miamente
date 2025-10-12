"""
Role service for managing roles in the Miamente platform.
"""

from typing import List, Optional
import uuid

from sqlalchemy.orm import Session

from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate


class RoleService:
    """Service for managing roles."""

    def __init__(self, db: Session):
        self.db = db

    def get_role_by_id(self, role_id: uuid.UUID) -> Optional[Role]:
        """Get role by ID."""
        return self.db.query(Role).filter(Role.id == role_id).first()

    def get_role_by_name(self, name: str) -> Optional[Role]:
        """Get role by name."""
        return self.db.query(Role).filter(Role.name == name).first()

    def get_all_roles(self) -> List[Role]:
        """Get all roles."""
        return self.db.query(Role).all()

    def create_role(self, role_data: RoleCreate) -> Role:
        """Create a new role."""
        db_role = Role(name=role_data.name, description=role_data.description)
        self.db.add(db_role)
        self.db.commit()
        self.db.refresh(db_role)
        return db_role

    def update_role(self, role_id: uuid.UUID, role_data: RoleUpdate) -> Optional[Role]:
        """Update an existing role."""
        db_role = self.get_role_by_id(role_id)
        if not db_role:
            return None

        if role_data.name is not None:
            db_role.name = role_data.name
        if role_data.description is not None:
            db_role.description = role_data.description

        self.db.commit()
        self.db.refresh(db_role)
        return db_role

    def delete_role(self, role_id: uuid.UUID) -> bool:
        """Delete a role."""
        db_role = self.get_role_by_id(role_id)
        if not db_role:
            return False

        self.db.delete(db_role)
        self.db.commit()
        return True

    def ensure_default_roles(self):
        """Ensure default roles exist in the database."""
        default_roles = [
            {"name": "user", "description": "Usuario regular (paciente)"},
            {"name": "professional", "description": "Profesional de salud mental"},
            {"name": "admin", "description": "Administrador del sistema"},
        ]

        for role_data in default_roles:
            existing_role = self.get_role_by_name(role_data["name"])
            if not existing_role:
                self.create_role(RoleCreate(**role_data))

