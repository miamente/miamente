#!/usr/bin/env python3
"""
Script to migrate data from Firebase Firestore to PostgreSQL.
This script should be run after setting up the PostgreSQL database.
"""
import asyncio
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, List

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

import firebase_admin
from firebase_admin import credentials, firestore
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models import Base, User, Professional, Appointment, Availability, Payment
from app.models.appointment import AppointmentStatus
from app.models.availability import SlotStatus
from app.models.payment import PaymentStatus, PaymentProvider


class FirebaseToPostgresMigrator:
    """Migrate data from Firebase to PostgreSQL."""
    
    def __init__(self):
        # Initialize Firebase
        if not firebase_admin._apps:
            # You'll need to download your Firebase service account key
            cred = credentials.Certificate("path/to/your/service-account-key.json")
            firebase_admin.initialize_app(cred)
        
        self.firestore_db = firestore.client()
        
        # Initialize PostgreSQL
        self.engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db = SessionLocal()
        
        # Create tables
        Base.metadata.create_all(bind=self.engine)
    
    def migrate_users(self) -> Dict[str, str]:
        """Migrate users from Firestore to PostgreSQL."""
        print("Migrating users...")
        firebase_users = self.firestore_db.collection('users').stream()
        user_id_mapping = {}
        
        for doc in firebase_users:
            user_data = doc.to_dict()
            user_id = doc.id
            
            # Create new user in PostgreSQL
            new_user = User(
                email=user_data.get('email', ''),
                full_name=user_data.get('fullName', ''),
                phone=user_data.get('phone'),
                is_active=user_data.get('isActive', True),
                is_verified=user_data.get('isVerified', False),
                profile_picture=user_data.get('profilePicture'),
                date_of_birth=user_data.get('dateOfBirth'),
                emergency_contact=user_data.get('emergencyContact'),
                emergency_phone=user_data.get('emergencyPhone'),
                preferences=json.dumps(user_data.get('preferences', {})) if user_data.get('preferences') else None,
                created_at=user_data.get('createdAt'),
                updated_at=user_data.get('updatedAt')
            )
            
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            
            # Store mapping for foreign key references
            user_id_mapping[user_id] = str(new_user.id)
            print(f"Migrated user: {user_data.get('email')} -> {new_user.id}")
        
        return user_id_mapping
    
    def migrate_professionals(self) -> Dict[str, str]:
        """Migrate professionals from Firestore to PostgreSQL."""
        print("Migrating professionals...")
        firebase_professionals = self.firestore_db.collection('professionals').stream()
        professional_id_mapping = {}
        
        for doc in firebase_professionals:
            pro_data = doc.to_dict()
            pro_id = doc.id
            
            # Create new professional in PostgreSQL
            new_professional = Professional(
                email=pro_data.get('email', ''),
                full_name=pro_data.get('fullName', ''),
                phone=pro_data.get('phone'),
                is_active=pro_data.get('isActive', True),
                is_verified=pro_data.get('isVerified', False),
                profile_picture=pro_data.get('profilePicture'),
                specialty=pro_data.get('specialty', ''),
                license_number=pro_data.get('licenseNumber'),
                years_experience=pro_data.get('yearsExperience', 0),
                rate_cents=pro_data.get('rateCents', 0),
                currency=pro_data.get('currency', 'COP'),
                bio=pro_data.get('bio'),
                education=json.dumps(pro_data.get('education', {})) if pro_data.get('education') else None,
                certifications=pro_data.get('certifications'),
                languages=pro_data.get('languages'),
                therapy_approaches=pro_data.get('therapyApproaches'),
                timezone=pro_data.get('timezone', 'America/Bogota'),
                emergency_contact=pro_data.get('emergencyContact'),
                emergency_phone=pro_data.get('emergencyPhone'),
                created_at=pro_data.get('createdAt'),
                updated_at=pro_data.get('updatedAt')
            )
            
            self.db.add(new_professional)
            self.db.commit()
            self.db.refresh(new_professional)
            
            # Store mapping for foreign key references
            professional_id_mapping[pro_id] = str(new_professional.id)
            print(f"Migrated professional: {pro_data.get('email')} -> {new_professional.id}")
        
        return professional_id_mapping
    
    def migrate_availability(self, professional_id_mapping: Dict[str, str]) -> Dict[str, str]:
        """Migrate availability from Firestore to PostgreSQL."""
        print("Migrating availability...")
        firebase_availability = self.firestore_db.collection('availability').stream()
        availability_id_mapping = {}
        
        for doc in firebase_availability:
            slot_data = doc.to_dict()
            slot_id = doc.id
            
            # Map professional ID
            old_pro_id = slot_data.get('professionalId')
            if old_pro_id not in professional_id_mapping:
                print(f"Warning: Professional {old_pro_id} not found for slot {slot_id}")
                continue
            
            new_pro_id = professional_id_mapping[old_pro_id]
            
            # Map user ID if held
            held_by = None
            if slot_data.get('heldBy'):
                # You'll need to map this to the new user ID
                # For now, we'll skip held slots
                print(f"Warning: Slot {slot_id} is held, skipping for now")
                continue
            
            # Create new availability in PostgreSQL
            new_availability = Availability(
                professional_id=new_pro_id,
                date=slot_data.get('date'),
                time=slot_data.get('time', ''),
                duration=slot_data.get('duration', 60),
                timezone=slot_data.get('timezone', 'America/Bogota'),
                status=SlotStatus.FREE,  # Reset all slots to free
                held_by=held_by,
                held_at=slot_data.get('heldAt'),
                created_at=slot_data.get('createdAt'),
                updated_at=slot_data.get('updatedAt')
            )
            
            self.db.add(new_availability)
            self.db.commit()
            self.db.refresh(new_availability)
            
            # Store mapping for foreign key references
            availability_id_mapping[slot_id] = str(new_availability.id)
            print(f"Migrated availability: {slot_id} -> {new_availability.id}")
        
        return availability_id_mapping
    
    def migrate_appointments(self, user_id_mapping: Dict[str, str], professional_id_mapping: Dict[str, str], availability_id_mapping: Dict[str, str]):
        """Migrate appointments from Firestore to PostgreSQL."""
        print("Migrating appointments...")
        firebase_appointments = self.firestore_db.collection('appointments').stream()
        
        for doc in firebase_appointments:
            appointment_data = doc.to_dict()
            appointment_id = doc.id
            
            # Map IDs
            old_user_id = appointment_data.get('userId')
            old_pro_id = appointment_data.get('professionalId')
            old_slot_id = appointment_data.get('slotId')
            
            if old_user_id not in user_id_mapping:
                print(f"Warning: User {old_user_id} not found for appointment {appointment_id}")
                continue
            
            if old_pro_id not in professional_id_mapping:
                print(f"Warning: Professional {old_pro_id} not found for appointment {appointment_id}")
                continue
            
            if old_slot_id not in availability_id_mapping:
                print(f"Warning: Availability {old_slot_id} not found for appointment {appointment_id}")
                continue
            
            new_user_id = user_id_mapping[old_user_id]
            new_pro_id = professional_id_mapping[old_pro_id]
            new_slot_id = availability_id_mapping[old_slot_id]
            
            # Map status
            status_mapping = {
                'pending_payment': AppointmentStatus.PENDING_PAYMENT,
                'paid': AppointmentStatus.PAID,
                'confirmed': AppointmentStatus.CONFIRMED,
                'in_progress': AppointmentStatus.IN_PROGRESS,
                'completed': AppointmentStatus.COMPLETED,
                'cancelled': AppointmentStatus.CANCELLED,
                'no_show': AppointmentStatus.NO_SHOW
            }
            
            old_status = appointment_data.get('status', 'pending_payment')
            new_status = status_mapping.get(old_status, AppointmentStatus.PENDING_PAYMENT)
            
            # Create new appointment in PostgreSQL
            new_appointment = Appointment(
                user_id=new_user_id,
                professional_id=new_pro_id,
                availability_id=new_slot_id,
                start_time=appointment_data.get('startTime') or appointment_data.get('slot', {}).get('date'),
                end_time=appointment_data.get('endTime'),
                duration=appointment_data.get('duration', 60),
                timezone=appointment_data.get('timezone', 'America/Bogota'),
                status=new_status,
                paid=appointment_data.get('paid', False),
                payment_amount_cents=appointment_data.get('payment', {}).get('amountCents', 0),
                payment_currency=appointment_data.get('payment', {}).get('currency', 'COP'),
                payment_provider=appointment_data.get('payment', {}).get('provider', 'mock'),
                payment_status=appointment_data.get('payment', {}).get('status', 'pending'),
                jitsi_url=appointment_data.get('jitsiUrl'),
                session_notes=appointment_data.get('sessionNotes'),
                session_rating=appointment_data.get('sessionRating'),
                session_feedback=appointment_data.get('sessionFeedback'),
                created_at=appointment_data.get('createdAt'),
                updated_at=appointment_data.get('updatedAt'),
                cancelled_at=appointment_data.get('cancelledAt'),
                completed_at=appointment_data.get('completedAt')
            )
            
            self.db.add(new_appointment)
            self.db.commit()
            self.db.refresh(new_appointment)
            
            print(f"Migrated appointment: {appointment_id} -> {new_appointment.id}")
    
    def run_migration(self):
        """Run the complete migration."""
        print("Starting Firebase to PostgreSQL migration...")
        
        try:
            # Migrate in order (respecting foreign key constraints)
            user_id_mapping = self.migrate_users()
            professional_id_mapping = self.migrate_professionals()
            availability_id_mapping = self.migrate_availability(professional_id_mapping)
            self.migrate_appointments(user_id_mapping, professional_id_mapping, availability_id_mapping)
            
            print("Migration completed successfully!")
            
        except Exception as e:
            print(f"Migration failed: {e}")
            self.db.rollback()
            raise
        finally:
            self.db.close()


if __name__ == "__main__":
    migrator = FirebaseToPostgresMigrator()
    migrator.run_migration()
