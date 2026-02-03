#!/usr/bin/env python3

from datetime import date, timedelta
import random

from config import app, db
from models import User, MediaItem, ListEntry, Review, Follow


def seed_data():
    print("Clearing database...")

    Follow.query.delete()
    Review.query.delete()
    ListEntry.query.delete()
    MediaItem.query.delete()
    User.query.delete()

    print("Creating users...")

    alice = User(username="alice")
    alice.password_hash = "password123"

    bob = User(username="bob")
    bob.password_hash = "password123"

    charlie = User(username="charlie")
    charlie.password_hash = "password123"

    ben = User(username="ben")
    ben.password_hash = "password"

    db.session.add_all([alice, bob, charlie, ben])
    db.session.commit()

    print("Creating media items...")

    book = MediaItem(
        type="book",
        title="Atomic Habits",
        creator="James Clear",
        details="Self-improvement and habit formation",
        user_id=alice.id
    )

    book1 = MediaItem(
        type="book",
        title="Against the Machine",
        creator="Paul Kingsnorth",
        details="A spiritual manual for dissidents in the technological age",
        user_id=ben.id
    )

    book2 = MediaItem(
        type="book",
        title="Discipline Equals Freedom",
        creator="Jocko Willink",
        details="You gain freedom by constraining yourself",
        user_id=ben.id
    )

    book3 = MediaItem(
        type="book",
        title="The Power of Habit",
        creator="Charles Duhigg",
        details="Explores the science behind habit formation and change.",
        user_id=ben.id
    )

    movie = MediaItem(
        type="movie",
        title="Inception",
        creator="Christopher Nolan",
        details="Sci-fi thriller about dreams.",
        user_id=bob.id
    )

    movie1 = MediaItem(
        type="movie",
        title="Superman",
        creator="James Gunn",
        details="Superman facing unintended consequences after stopping a war between Boravia and Jarhanpur.",
        user_id=ben.id
    )

    movie2 = MediaItem(
        type="movie",
        title="Bugonia",
        creator="Yorgos Lanthimos",
        details="Two conspiracy obsessed young men kidnap the high-powered CEO of a major company, convinced that she is an alien intent on destroying planet Earth.",
        user_id=ben.id
    )

    show = MediaItem(
        type="show",
        title="Invincible",
        creator="Robert Kirkman",
        details="Superhero animated series",
        user_id=alice.id
    )

    show1 = MediaItem(
        type="show",
        title="Community",
        creator="Dan Harmon",
        details="Follows Jeff Winger, a disbarred lawyer who enrolls at the college to earn a legitimate degree, and his formation of a study group with a diverse group of misfit students",
        user_id=ben.id
    )

    show2 = MediaItem(
        type="show",
        title="Breaking Bad",
        creator="Vince Gilligan",
        details="Walter White, a high school chemistry teacher who turns to manufacturing and selling methamphetamine after being diagnosed with terminal lung cancer, aiming to secure his family's financial future.",
        user_id=ben.id
    )

    game = MediaItem(
        type="game",
        title="Dark Souls",
        creator="FromSoftware",
        details="Set in Lordran, focusing on the cycle of fire and the fate of the undead.",
        user_id=ben.id
    )

    game1 = MediaItem(
        type="game",
        title="Astro Bot",
        creator="Team Asobi",
        details="Follows Astro, a small robot who must rescue his scattered crew and rebuild the PS5-shaped mothership after it's attacked by the alien Space Bully Nebulax.",
        user_id=ben.id
    )

    db.session.add_all([book, book1, book2, book3, movie, movie1, movie2, show, show1, show2, game, game1])
    db.session.commit()

    print("Creating list entries...")

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

    entry4 = ListEntry(
        user_id=ben.id,
        media_id=book1.id,
        status=True,
        completed_at=date.today()
    )

    db.session.add_all([entry1, entry2, entry3, entry4])
    db.session.commit()

    print("Creating reviews...")

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

    review3 = Review(
        user_id=ben.id,
        media_id=book1.id,
        rating=80,
        text="An excellent book discussing how to rebel against the machine of capitalism."
    )

    db.session.add_all([review1, review2, review3])
    db.session.commit()

    print("Creating follows...")

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

    follow4 = Follow(
        follower_id=ben.id,
        following_id=charlie.id
    )

    follow5 = Follow(
        follower_id=ben.id,
        following_id=alice.id
    )

    follow6 = Follow(
        follower_id=ben.id,
        following_id=bob.id
    )

    db.session.add_all([follow1, follow2, follow3, follow4, follow5, follow6])
    db.session.commit()

    print("Database seeded successfully!")


if __name__ == "__main__":
    with app.app_context():
        seed_data()