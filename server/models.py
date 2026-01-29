from sqlalchemy.orm import validates
from marshmallow import Schema, fields, validate
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import date

from config import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)
    created_at = db.Column(db.Date, nullable=False, default=date.today)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
        }

    @hybrid_property
    def password_hash(self):
        raise AttributeError('Password hashes may not be viewed.')

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(
            password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(
            self._password_hash, password.encode('utf-8'))

    def __repr__(self):
        return f'<User {self.username}>'

class MediaItem(db.Model):
    __tablename__ = 'mediaItems'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String, nullable=False)
    title = db.Column(db.String, nullable=False)
    creator = db.Column(db.String, nullable=False)
    metadata = db.Column(db.String)
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'))

class ListEntry(db.Model):
    __tablename__ = 'listEntries'

    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)
    media_id = db.Column(db.Integer(), db.ForeignKey('mediaItems.id'), nullable=False)
    status = db.Column(db.Boolean, nullable=False, default=False)
    added_at = db.Column(db.Date, nullable=False, default=date.today)
    completed_at = db.Column(db.Date)

class Review(db.Model):
    __tablename__ = 'reviews'

    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)
    media_id = db.Column(db.Integer(), db.ForeignKey('mediaItems.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    text = db.Column(db.String)
    created_at = db.Column(db.Date, nullable=False, default=date.today)

class Follow(db.Model):
    __tablename__ = 'follows'

    follower_id = db.Column(db.Integer)
    following_id = db.Column(db.Integer)