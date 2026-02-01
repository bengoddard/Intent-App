#!/usr/bin/env python3

from datetime import date, timedelta
import random

from config import app, db
from models import User, MediaItem, ListEntry, Review, Follow


def seed_data():
    print("🌱 Clearing database...")

    Follow.query.delete()
    Review.query.delete()
    ListEntry.query.delete()
    MediaItem.query.delete()
    User.query.delete()

    print("👤 Creating users...")

    alice = User(username="alice")
    alice.password_hash = "password123"

    bob = User(username="bob")
    bob.password_hash = "password123"

    charlie = User(username="charlie")
    charlie.password_hash = "password123"

    db.session.add_all([alice, bob, charlie])
    db.session.commit()

    print("🎬 Creating media items...")

    book = MediaItem(
        type="book",
        title="Atomic Habits",
        creator="James Clear",
        details="Self-improvement and habit formation",
        user_id=alice.id
    )

    movie = MediaItem(
        type="movie",
        title="Inception",
        creator="Christopher Nolan",
        details="Sci-fi thriller about dreams",
        user_id=bob.id
    )

    show = MediaItem(
        type="show",
        title="Invincible",
        creator="Robert Kirkman",
        details="Superhero animated series",
        user_id=alice.id
    )

    db.session.add_all([book, movie, show])
    db.session.commit()

    print("📋 Creating list entries...")

    entry1 = ListEntry(
        user_id=alice.id,
        media_id=movie.id,
        status=False
    )

    entry2 = ListEntry(
        user_id=bob.id,
        media_id=book.id,
        status=True,
        completed_at=date.today()
    )

    entry3 = ListEntry(
        user_id=charlie.id,
        media_id=show.id,
        status=False
    )

    db.session.add_all([entry1, entry2, entry3])
    db.session.commit()

    print("⭐ Creating reviews...")

    review1 = Review(
        user_id=alice.id,
        media_id=book.id,
        rating=95,
        text="Life-changing and super practical."
    )

    review2 = Review(
        user_id=bob.id,
        media_id=movie.id,
        rating=85,
        text="Mind-bending visuals and story."
    )

    db.session.add_all([review1, review2])
    db.session.commit()

    print("🤝 Creating follows...")

    follow1 = Follow(
        follower_id=alice.id,
        following_id=bob.id
    )

    follow2 = Follow(
        follower_id=bob.id,
        following_id=alice.id
    )

    follow3 = Follow(
        follower_id=charlie.id,
        following_id=alice.id
    )

    db.session.add_all([follow1, follow2, follow3])
    db.session.commit()

    print("✅ Database seeded successfully!")


if __name__ == "__main__":
    with app.app_context():
        seed_data()