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

    media_items = db.relationship(
        'MediaItem',
        back_populates='user',
        cascade='all, delete-orphan'
    )

    list_entries = db.relationship(
        'ListEntry',
        back_populates='user',
        cascade='all, delete-orphan'
    )

    reviews = db.relationship(
        'Review',
        back_populates='user',
        cascade='all, delete-orphan'
    )

    following = db.relationship(
        'Follow',
        foreign_keys='Follow.follower_id',
        back_populates='follower',
        cascade='all, delete-orphan'
    )

    followers = db.relationship(
        'Follow',
        foreign_keys='Follow.following_id',
        back_populates='following',
        cascade='all, delete-orphan'
    )

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
        }

    @validates('username')
    def validate_username(self, key, value):
        value = (value or '').strip()
        if len(value) < 3:
            raise ValueError("Username must be at least 3 characters.")
        return value

    @hybrid_property
    def password_hash(self):
        raise AttributeError('Password hashes may not be viewed.')

    @password_hash.setter
    def password_hash(self, password):
        if not password or len(password) < 8:
            raise ValueError("Password must be at least 8 characters.")
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(
            self._password_hash, password.encode('utf-8'))

    def __repr__(self):
        return f'<User {self.username}>'

class MediaItem(db.Model):
    __tablename__ = 'media_items'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String, nullable=False)
    title = db.Column(db.String, nullable=False)
    creator = db.Column(db.String, nullable=False)
    details = db.Column(db.String)

    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'))
    user = db.relationship("User", back_populates="media_items")

    list_entries = db.relationship('ListEntry', back_populates='media_item', cascade='all, delete-orphan')

    reviews = db.relationship('Review', back_populates='media_item', cascade='all, delete-orphan')

    @validates('type')
    def validate_type(self, key, value):
        allowed = {'book', 'movie', 'show', 'game', 'music'}
        v = (value or '').strip().lower()
        if v not in allowed:
            raise ValueError(f"type must be one of: {sorted(allowed)}")
        return v

class ListEntry(db.Model):
    __tablename__ = 'list_entries'

    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False, primary_key=True)
    media_id = db.Column(db.Integer(), db.ForeignKey('media_items.id'), nullable=False, primary_key=True)
    status = db.Column(db.Boolean, nullable=False, default=False)
    added_at = db.Column(db.Date, nullable=False, default=date.today)
    completed_at = db.Column(db.Date)

    user = db.relationship('User', back_populates='list_entries')
    media_item = db.relationship('MediaItem', back_populates='list_entries')

class Review(db.Model):
    __tablename__ = 'reviews'

    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False, primary_key=True)
    media_id = db.Column(db.Integer(), db.ForeignKey('media_items.id'), nullable=False, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    text = db.Column(db.String)
    created_at = db.Column(db.Date, nullable=False, default=date.today)

    user = db.relationship('User', back_populates='reviews')
    media_item = db.relationship('MediaItem', back_populates='reviews')

    @validates('rating')
    def validate_rating(self, key, value):
        if value is None or not (0 <= int(value) <= 100):
            raise ValueError("rating must be an integer between 0 and 100.")
        return int(value)

class Follow(db.Model):
    __tablename__ = 'follows'

    follower_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    following_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)

    follower = db.relationship(
        'User',
        foreign_keys=[follower_id],
        back_populates='following'
    )

    following = db.relationship(
        'User',
        foreign_keys=[following_id],
        back_populates='followers'
    )

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=6, error="Username must be at least 6 characters long."))
    password = fields.Str(load_only=True, required=True, validate=validate.Length(min=8, error="Password must be at least 8 characters long."))
    created_at = fields.Date(required=True, dump_only=True)

    media_items = fields.List(fields.Nested(lambda: MediaItemSchema(exclude=("user",))), dump_only=True)
    list_entries = fields.List(fields.Nested(lambda: ListEntrySchema), dump_only=True)
    reviews = fields.List(fields.Nested(lambda: ReviewSchema), dump_only=True)

    followers = fields.List(fields.Nested(lambda: FollowSchema), dump_only=True)
    following = fields.List(fields.Nested(lambda: FollowSchema), dump_only=True)

class MediaItemSchema(Schema):
    id = fields.Int(dump_only=True)
    type = fields.Str(required=True)
    title = fields.Str(required=True)
    creator = fields.Str(required=True)
    details = fields.Str(required=True)
    user_id = fields.Int()
    user = fields.Nested(lambda: UserSchema(exclude=("media_items", "list_entries", "reviews", "followers", "following")), dump_only=True)

class ListEntrySchema(Schema):
    user_id = fields.Int()
    media_id = fields.Int()
    status = fields.Boolean(required=True)
    added_at = fields.Date(required=True)
    completed_at = fields.Date()

    media_item = fields.Nested(MediaItemSchema, dump_only=True)

class ReviewSchema(Schema):
    user_id = fields.Int()
    media_id = fields.Int()
    rating = fields.Int(validate=validate.Range(min=0, max=100))
    text = fields.Str(allow_none=True)
    created_at = fields.Date(dump_only=True)

    media_item = fields.Nested(MediaItemSchema, dump_only=True)

class FollowSchema(Schema):
    follower_id = fields.Int(dump_only=True)
    following_id = fields.Int(dump_only=True)