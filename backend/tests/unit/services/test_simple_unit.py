"""
Simple unit tests to demonstrate mocking works - no database connection.
"""
import pytest
from unittest.mock import MagicMock, patch


class TestSimpleUnit:
    """Simple unit tests with mocked dependencies."""
    
    def test_password_hashing_mocked(self):
        """Test password hashing with mocked function."""
        with patch('app.core.security.get_password_hash', return_value="mocked_hash") as mock_hash:
            # Import here to ensure the patch is applied
            from app.core.security import get_password_hash
            result = get_password_hash("test_password")
            
            assert result == "mocked_hash"
            mock_hash.assert_called_once_with("test_password")
    
    def test_password_verification_mocked(self):
        """Test password verification with mocked function."""
        with patch('app.core.security.verify_password', return_value=True) as mock_verify:
            # Import here to ensure the patch is applied
            from app.core.security import verify_password
            result = verify_password("plain_password", "hashed_password")
            
            assert result is True
            mock_verify.assert_called_once_with("plain_password", "hashed_password")
    
    def test_database_session_mocked(self, db_session):
        """Test that database session is properly mocked."""
        # Verify the session is a mock
        assert isinstance(db_session, MagicMock)
        
        # Test that we can set up mock behavior
        mock_user = MagicMock()
        mock_user.email = "test@example.com"
        
        db_session.query.return_value.filter.return_value.first.return_value = mock_user
        
        # Simulate a database query
        result = db_session.query("User").filter("email == 'test@example.com'").first()
        
        assert result == mock_user
        db_session.query.assert_called_once_with("User")
    
    def test_no_database_connection(self, db_session):
        """Test that no real database connection is made."""
        # The db_session should be a mock, not a real database connection
        assert hasattr(db_session, 'query')
        assert hasattr(db_session, 'add')
        assert hasattr(db_session, 'commit')
        assert hasattr(db_session, 'rollback')
        
        # These should be mock methods, not real database methods
        assert callable(db_session.query)
        assert callable(db_session.add)
        assert callable(db_session.commit)
        assert callable(db_session.rollback)
        
        # Verify it's a MagicMock
        assert isinstance(db_session, MagicMock)
    
    def test_mock_chain_operations(self, db_session):
        """Test chained mock operations work correctly."""
        # Set up mock chain
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_first = MagicMock()
        
        db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = mock_first
        
        # Execute chained operation
        result = db_session.query("User").filter("email == 'test@example.com'").first()
        
        # Verify the chain worked
        assert result == mock_first
        db_session.query.assert_called_once_with("User")
        mock_query.filter.assert_called_once_with("email == 'test@example.com'")
        mock_filter.first.assert_called_once()
    
    def test_mock_side_effects(self, db_session):
        """Test mock side effects work correctly."""
        # Set up side effects for different calls
        db_session.query.side_effect = [
            MagicMock(),  # First call
            MagicMock(),  # Second call
        ]
        
        # First call
        result1 = db_session.query("User")
        assert isinstance(result1, MagicMock)
        
        # Second call
        result2 = db_session.query("Professional")
        assert isinstance(result2, MagicMock)
        
        # Verify both calls were made
        assert db_session.query.call_count == 2
        db_session.query.assert_any_call("User")
        db_session.query.assert_any_call("Professional")
