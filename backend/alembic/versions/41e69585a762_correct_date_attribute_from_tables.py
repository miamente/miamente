"""correct date attribute from tables

Revision ID: 41e69585a762
Revises: 9eb63f5a9477
Create Date: 2025-09-19 17:25:22.942921
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "41e69585a762"
down_revision = "9eb63f5a9477"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # modalities
    op.alter_column(
        "modalities",
        "is_active",
        existing_type=sa.BOOLEAN(),
        nullable=False,
    )
    op.alter_column(
        "modalities",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "modalities",
        "updated_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
    )

    # professional_modalities
    op.alter_column(
        "professional_modalities",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "professional_modalities",
        "updated_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
    )

    # professional_specialties (VARCHAR -> timestamptz REQUIERE USING)
    op.alter_column(
        "professional_specialties",
        "created_at",
        existing_type=sa.VARCHAR(length=255),
        type_=sa.DateTime(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::timestamptz",
    )

    # professional_therapeutic_approaches
    op.alter_column(
        "professional_therapeutic_approaches",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
    )

    # professionals
    op.alter_column(
        "professionals",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "professionals",
        "updated_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
    )
    op.drop_constraint("professionals_email_key", "professionals", type_="unique")
    op.drop_index("ix_professionals_email", table_name="professionals")
    op.create_index(op.f("ix_professionals_email"), "professionals", ["email"], unique=True)

    # specialties (VARCHAR -> timestamptz REQUIERE USING)
    op.alter_column(
        "specialties",
        "created_at",
        existing_type=sa.VARCHAR(length=255),
        type_=sa.DateTime(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::timestamptz",
    )
    op.alter_column(
        "specialties",
        "updated_at",
        existing_type=sa.VARCHAR(length=255),
        type_=sa.DateTime(timezone=True),
        nullable=False,
        postgresql_using="updated_at::timestamptz",
    )

    # therapeutic_approaches (VARCHAR -> timestamptz REQUIERE USING)
    op.alter_column(
        "therapeutic_approaches",
        "created_at",
        existing_type=sa.VARCHAR(length=255),
        type_=sa.DateTime(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::timestamptz",
    )
    op.alter_column(
        "therapeutic_approaches",
        "updated_at",
        existing_type=sa.VARCHAR(length=255),
        type_=sa.DateTime(timezone=True),
        nullable=False,
        postgresql_using="updated_at::timestamptz",
    )
    op.drop_column("therapeutic_approaches", "is_active")

    # users
    op.alter_column(
        "users",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "users",
        "updated_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
    )
    op.drop_constraint("users_email_key", "users", type_="unique")
    op.drop_index("ix_users_email", table_name="users")
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)


def downgrade() -> None:
    # users
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.create_index("ix_users_email", "users", ["email"], unique=False)
    op.create_unique_constraint("users_email_key", "users", ["email"])
    op.alter_column(
        "users",
        "updated_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
    )
    op.alter_column(
        "users",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
        existing_server_default=sa.text("now()"),
    )

    # therapeutic_approaches (timestamptz -> VARCHAR)
    op.add_column(
        "therapeutic_approaches",
        sa.Column("is_active", sa.BOOLEAN(), autoincrement=False, nullable=True),
    )
    op.alter_column(
        "therapeutic_approaches",
        "updated_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.VARCHAR(length=255),
        nullable=True,
        postgresql_using="updated_at::text",
    )
    op.alter_column(
        "therapeutic_approaches",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.VARCHAR(length=255),
        nullable=True,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::text",
    )

    # specialties (timestamptz -> VARCHAR)
    op.alter_column(
        "specialties",
        "updated_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.VARCHAR(length=255),
        nullable=True,
        postgresql_using="updated_at::text",
    )
    op.alter_column(
        "specialties",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.VARCHAR(length=255),
        nullable=True,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::text",
    )

    # professionals
    op.drop_index(op.f("ix_professionals_email"), table_name="professionals")
    op.create_index("ix_professionals_email", "professionals", ["email"], unique=False)
    op.create_unique_constraint("professionals_email_key", "professionals", ["email"])
    op.alter_column(
        "professionals",
        "updated_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
    )
    op.alter_column(
        "professionals",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
        existing_server_default=sa.text("now()"),
    )

    # professional_therapeutic_approaches
    op.alter_column(
        "professional_therapeutic_approaches",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
        existing_server_default=sa.text("now()"),
    )

    # professional_specialties (timestamptz -> VARCHAR)
    op.alter_column(
        "professional_specialties",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.VARCHAR(length=255),
        nullable=True,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at::text",
    )

    # professional_modalities
    op.alter_column(
        "professional_modalities",
        "updated_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
    )
    op.alter_column(
        "professional_modalities",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
        existing_server_default=sa.text("now()"),
    )

    # modalities
    op.alter_column(
        "modalities",
        "updated_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
    )
    op.alter_column(
        "modalities",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "modalities",
        "is_active",
        existing_type=sa.BOOLEAN(),
        nullable=True,
    )
