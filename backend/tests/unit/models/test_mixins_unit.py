"""
Unit tests for app.models.mixins module.
"""

import uuid
from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.models.mixins import (
    TimestampMixin,
    BaseNamedModelMixin,
    BaseJunctionModelMixin,
    DescriptionMixin,
)


class TestTimestampMixin:
    """Test the TimestampMixin class."""

    def test_timestamp_mixin_has_fields(self):
        """Test that TimestampMixin provides correct field attributes."""
        # Check that the mixin has the expected field attributes
        assert hasattr(TimestampMixin, "created_at")
        assert hasattr(TimestampMixin, "updated_at")

        # Check that the fields are Column instances
        assert isinstance(TimestampMixin.created_at, Column)
        assert isinstance(TimestampMixin.updated_at, Column)

    def test_timestamp_mixin_field_types(self):
        """Test that timestamp fields have correct types."""
        # Check field types
        assert isinstance(TimestampMixin.created_at.type, DateTime)
        assert isinstance(TimestampMixin.updated_at.type, DateTime)

    def test_timestamp_mixin_field_properties(self):
        """Test that timestamp fields have correct properties."""
        # Check nullable settings
        assert not TimestampMixin.created_at.nullable
        assert not TimestampMixin.updated_at.nullable


class TestBaseNamedModelMixin:
    """Test the BaseNamedModelMixin class."""

    def test_base_named_model_mixin_has_fields(self):
        """Test that BaseNamedModelMixin provides correct field attributes."""
        # Check that the mixin has the expected field attributes
        assert hasattr(BaseNamedModelMixin, "id")
        assert hasattr(BaseNamedModelMixin, "name")
        assert hasattr(BaseNamedModelMixin, "category")
        assert hasattr(BaseNamedModelMixin, "is_active")

    def test_base_named_model_mixin_field_types(self):
        """Test that BaseNamedModelMixin fields have correct types."""
        # Check field types
        assert isinstance(BaseNamedModelMixin.id, Column)
        assert isinstance(BaseNamedModelMixin.name, Column)
        assert isinstance(BaseNamedModelMixin.category, Column)
        assert isinstance(BaseNamedModelMixin.is_active, Column)

        assert isinstance(BaseNamedModelMixin.id.type, UUID)
        assert isinstance(BaseNamedModelMixin.name.type, String)
        assert isinstance(BaseNamedModelMixin.category.type, String)
        assert isinstance(BaseNamedModelMixin.is_active.type, Boolean)

    def test_base_named_model_mixin_field_properties(self):
        """Test that BaseNamedModelMixin fields have correct properties."""
        # Check constraints
        assert BaseNamedModelMixin.id.primary_key
        assert not BaseNamedModelMixin.name.nullable
        assert BaseNamedModelMixin.name.unique
        assert BaseNamedModelMixin.category.nullable
        assert not BaseNamedModelMixin.is_active.nullable

    def test_base_named_model_mixin_repr(self):
        """Test the __repr__ method of BaseNamedModelMixin."""

        # Create a class that inherits from the mixin
        class TestModel(BaseNamedModelMixin):
            pass

        # Create an instance with mock values
        instance = TestModel()
        instance.id = uuid.uuid4()
        instance.name = "Test Name"

        # Test repr
        repr_str = repr(instance)
        expected = f"<TestModel(id={instance.id}, name=Test Name)>"
        assert repr_str == expected

    def test_base_named_model_mixin_defaults(self):
        """Test default values for BaseNamedModelMixin fields."""
        # Check default values
        assert BaseNamedModelMixin.is_active.default.arg is True


class TestBaseJunctionModelMixin:
    """Test the BaseJunctionModelMixin class."""

    def test_base_junction_model_mixin_has_fields(self):
        """Test that BaseJunctionModelMixin provides correct field attributes."""
        # Check that the mixin has the expected field attributes
        assert hasattr(BaseJunctionModelMixin, "id")
        assert hasattr(BaseJunctionModelMixin, "professional_id")

    def test_base_junction_model_mixin_field_types(self):
        """Test that BaseJunctionModelMixin fields have correct types."""
        # Check field types
        assert isinstance(BaseJunctionModelMixin.id, Column)
        assert isinstance(BaseJunctionModelMixin.professional_id, Column)

        assert isinstance(BaseJunctionModelMixin.id.type, UUID)
        assert isinstance(BaseJunctionModelMixin.professional_id.type, UUID)

    def test_base_junction_model_mixin_field_properties(self):
        """Test that BaseJunctionModelMixin fields have correct properties."""
        # Check constraints
        assert BaseJunctionModelMixin.id.primary_key
        assert not BaseJunctionModelMixin.professional_id.nullable


class TestDescriptionMixin:
    """Test the DescriptionMixin class."""

    def test_description_mixin_has_field(self):
        """Test that DescriptionMixin provides correct field attribute."""
        # Check that the mixin has the expected field attribute
        assert hasattr(DescriptionMixin, "description")

    def test_description_mixin_field_type(self):
        """Test that DescriptionMixin field has correct type."""
        # Check field type
        assert isinstance(DescriptionMixin.description, Column)
        assert isinstance(DescriptionMixin.description.type, Text)

    def test_description_mixin_field_properties(self):
        """Test that DescriptionMixin field has correct properties."""
        # Check nullable setting
        assert DescriptionMixin.description.nullable


class TestMixinCombinations:
    """Test combining multiple mixins."""

    def test_mixin_fields_are_accessible(self):
        """Test that mixin fields are accessible when combined."""

        # Create a class that combines multiple mixins
        class CombinedModel(BaseNamedModelMixin, TimestampMixin, DescriptionMixin):
            pass

        # Check that all fields from all mixins are accessible
        assert hasattr(CombinedModel, "id")
        assert hasattr(CombinedModel, "name")
        assert hasattr(CombinedModel, "category")
        assert hasattr(CombinedModel, "is_active")
        assert hasattr(CombinedModel, "created_at")
        assert hasattr(CombinedModel, "updated_at")
        assert hasattr(CombinedModel, "description")

    def test_mixin_field_types_preserved(self):
        """Test that field types are preserved when mixins are combined."""

        # Create a class that combines multiple mixins
        class CombinedModel(BaseNamedModelMixin, TimestampMixin, DescriptionMixin):
            pass

        # Check that field types are correct
        assert isinstance(CombinedModel.id, Column)
        assert isinstance(CombinedModel.name, Column)
        assert isinstance(CombinedModel.created_at, Column)
        assert isinstance(CombinedModel.updated_at, Column)
        assert isinstance(CombinedModel.description, Column)

    def test_junction_with_timestamp_mixins(self):
        """Test combining junction and timestamp mixins."""

        # Create a class that combines junction and timestamp mixins
        class JunctionTimestampModel(BaseJunctionModelMixin, TimestampMixin):
            pass

        # Check that all fields are accessible
        assert hasattr(JunctionTimestampModel, "id")
        assert hasattr(JunctionTimestampModel, "professional_id")
        assert hasattr(JunctionTimestampModel, "created_at")
        assert hasattr(JunctionTimestampModel, "updated_at")


class TestMixinEdgeCases:
    """Test edge cases and error conditions."""

    def test_mixin_inheritance_order(self):
        """Test that mixin inheritance order doesn't break functionality."""

        # Test different inheritance orders
        class TestModel1(DescriptionMixin, BaseNamedModelMixin):
            pass

        class TestModel2(BaseNamedModelMixin, DescriptionMixin):
            pass

        # Both should have all fields
        assert hasattr(TestModel1, "description")
        assert hasattr(TestModel1, "name")
        assert hasattr(TestModel2, "description")
        assert hasattr(TestModel2, "name")

        # Field types should be correct regardless of order
        assert isinstance(TestModel1.description, Column)
        assert isinstance(TestModel1.name, Column)
        assert isinstance(TestModel2.description, Column)
        assert isinstance(TestModel2.name, Column)

    def test_mixin_with_custom_fields(self):
        """Test that mixins work with additional custom fields."""

        # Create a class with mixins and custom fields
        class CustomModel(BaseNamedModelMixin):
            custom_field = Column(String(100), nullable=True)

        # Should have both mixin and custom fields
        assert hasattr(CustomModel, "id")
        assert hasattr(CustomModel, "name")
        assert hasattr(CustomModel, "custom_field")

        # Custom field should be properly defined
        assert isinstance(CustomModel.custom_field, Column)
        assert isinstance(CustomModel.custom_field.type, String)
        assert CustomModel.custom_field.nullable

    def test_mixin_field_accessibility(self):
        """Test that mixin fields are accessible as class attributes."""
        # Test that we can access mixin fields directly
        assert TimestampMixin.created_at is not None
        assert TimestampMixin.updated_at is not None
        assert BaseNamedModelMixin.id is not None
        assert BaseNamedModelMixin.name is not None
        assert BaseJunctionModelMixin.id is not None
        assert BaseJunctionModelMixin.professional_id is not None
        assert DescriptionMixin.description is not None

    def test_mixin_field_consistency(self):
        """Test that mixin fields are consistent across multiple accesses."""
        # Test that accessing the same field multiple times returns the same object
        created_at_1 = TimestampMixin.created_at
        created_at_2 = TimestampMixin.created_at
        assert created_at_1 is created_at_2

        name_1 = BaseNamedModelMixin.name
        name_2 = BaseNamedModelMixin.name
        assert name_1 is name_2

    def test_mixin_field_properties_consistency(self):
        """Test that mixin field properties are consistent."""
        # Test that field properties are as expected
        assert TimestampMixin.created_at.nullable is False
        assert TimestampMixin.updated_at.nullable is False
        assert BaseNamedModelMixin.id.primary_key is True
        assert BaseNamedModelMixin.name.unique is True
        assert BaseNamedModelMixin.category.nullable is True
        assert BaseJunctionModelMixin.id.primary_key is True
        assert BaseJunctionModelMixin.professional_id.nullable is False
        assert DescriptionMixin.description.nullable is True
