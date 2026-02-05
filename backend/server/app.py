from flask import request, make_response, jsonify
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from config import app, db, api, jwt
from models import User, UserSchema, MediaItem, MediaItemSchema, ListEntry, ListEntrySchema, Review, ReviewSchema, Follow, FollowSchema
from flask_jwt_extended import create_access_token, get_jwt_identity, verify_jwt_in_request
from flask_cors import CORS
from datetime import date, timedelta

CORS(app, resources={r"/*": {"origins": "http://localhost:4000"}}, supports_credentials=True)
@app.before_request
def check_if_logged_in():
    if request.method == "OPTIONS":
        return make_response("", 200)
    open_access_list = ['signup', 'login']
    if request.endpoint in open_access_list:
        return
    try:
        verify_jwt_in_request()
    except Exception:
        return make_response(jsonify({'error': 'Missing or invalid token'}), 401)

class Signup(Resource):
    def post(self):
        request_json = request.get_json()

        username = request_json.get('username')
        password = request_json.get('password')

        try:
            user = User(
            username=username,
        )
            user.password_hash = password
            db.session.add(user)
            db.session.commit()
            access_token = create_access_token(identity=(user.id))
            return make_response(jsonify(token=access_token, user=UserSchema().dump(user)), 201)
        except IntegrityError:
            return {'error': '422 Unprocessable Entity'}, 422

class Login(Resource):
    def post(self):

        username = request.get_json()['username']
        password = request.get_json()['password']

        user = User.query.filter(User.username == username).first()

        if user and user.authenticate(password):
            token = create_access_token(identity=(user.id))
            return make_response(jsonify(token=token, user=UserSchema().dump(user)), 200)

        return {'error': '401 Unauthorized'}, 401

class Me(Resource):
    def get(self):
        user_id = int(get_jwt_identity())
        print(user_id)
        if user_id:
            return user_id

class Profile(Resource):
    def get(self, id):
        user = User.query.get(id)
        if not user:
            return {"error": "User not found"}, 404

        items = (
            MediaItem.query
            .filter_by(user_id=user.id)
            .order_by(MediaItem.id.desc())
            .limit(50)
            .all()
        )

        reviews = (
            Review.query
            .filter_by(user_id=user.id)
            .order_by(Review.created_at.desc())
            .all()
        )

        viewer_id = get_jwt_identity()

        is_following = Follow.query.filter_by(
        follower_id=int(viewer_id),
        following_id=int(user.id)
        ).first() is not None

        follower_count = Follow.query.filter_by(following_id=user.id).count()
        following_count = Follow.query.filter_by(follower_id=user.id).count()

        return {
            "profile": UserSchema().dump(user),
            "items": MediaItemSchema(many=True).dump(items),
            "reviews": ReviewSchema(many=True).dump(reviews),
            "follower_count": follower_count,
            "following_count": following_count,
            "is_following": is_following,
        }, 200

class Feed(Resource):
    def get(self):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404

        following_ids = [f.following_id for f in user.following]
        items = (
        MediaItem.query
        .filter(MediaItem.user_id.in_([user_id] + following_ids))
        .order_by(MediaItem.id.desc())
        .limit(50)
        .all()
    )

        return MediaItemSchema(many=True).dump(items), 200

class Items(Resource):
    def post(self):
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        try:
            item = MediaItem(
                type=data.get("type"),
                title=data.get("title"),
                creator=data.get("creator"),
                details=data.get("details"),
                user_id=user_id
            )
            db.session.add(item)
            db.session.commit()
            return MediaItemSchema().dump(item), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 422

class ItemByID(Resource):
    def get(self, id):
        user_id = int(get_jwt_identity())
        item = MediaItem.query.get(id)
        if not item:
            return {"error": "Item not found"}, 404

        reviews = (
            Review.query
            .filter_by(media_id=id)
            .order_by(Review.created_at.desc())
            .all()
        )

        my_entry = ListEntry.query.filter_by(user_id=user_id, media_id=id).first()

        return {
            "item": MediaItemSchema().dump(item),
            "reviews": ReviewSchema(many=True).dump(reviews),
            "my_list_entry": ListEntrySchema().dump(my_entry) if my_entry else None,
        }, 200

    def patch(self, id):
        user_id = get_jwt_identity()
        item = MediaItem.query.filter_by(id=id, user_id=user_id).first()
        if not item:
            return {"error": "Item not found"}, 404

        request_json = request.get_json()
        try:
            for attr in request_json:
                setattr(item, attr, request_json[attr])
            db.session.commit()
            return MediaItemSchema().dump(item), 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 422

    def delete(self, id):
        user_id = get_jwt_identity()
        item = MediaItem.query.filter_by(id=id, user_id=user_id).first()
        if not item:
            return {"error": "Item not found"}, 404

        db.session.delete(item)
        db.session.commit()
        return {}, 204

class Discover(Resource):
    def get(self):
        q = (request.args.get("q") or "").strip()

        query = MediaItem.query

        if q:
            query = query.filter(
                or_(
                    MediaItem.title.ilike(f"%{q}%"),
                    MediaItem.creator.ilike(f"%{q}%"),
                    MediaItem.type.ilike(f"%{q}%"),
                    MediaItem.details.ilike(f"%{q}%"),
                )
            )

        items = query.order_by(MediaItem.id.desc()).limit(50).all()
        return MediaItemSchema(many=True).dump(items), 200

class ToExperience(Resource):
    def get(self):
        user_id = int(get_jwt_identity())

        entries = (
            ListEntry.query
            .filter_by(user_id=user_id, status=False)
            .order_by(ListEntry.added_at.desc())
            .all()
        )

        return ListEntrySchema(many=True).dump(entries), 200

class ListEntries(Resource):
    def post(self):
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        media_id = data.get("media_id")
        if not media_id:
            return {"error": "media_id is required"}, 400

        existing = ListEntry.query.filter_by(user_id=user_id, media_id=media_id).first()
        if existing:
            return ListEntrySchema().dump(existing), 200

        try:
            entry = ListEntry(
                user_id=user_id,
                media_id=int(media_id),
                status=False,
                added_at=date.today(),
                completed_at=None
            )
            db.session.add(entry)
            db.session.commit()
            return ListEntrySchema().dump(entry), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 422

class ListEntryByMediaID(Resource):
    def delete(self, media_id):
        user_id = int(get_jwt_identity())

        entry = ListEntry.query.filter_by(user_id=user_id, media_id=media_id).first()
        if not entry:
            return {"error": "List entry not found"}, 404

        db.session.delete(entry)
        db.session.commit()
        return {}, 204

class ListEntryStatus(Resource):
    def patch(self, media_id):
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        entry = ListEntry.query.filter_by(user_id=user_id, media_id=media_id).first()
        if not entry:
            return {"error": "List entry not found"}, 404

        if "status" not in data:
            return {"error": "status is required (true/false)"}, 400

        new_status = bool(data["status"])
        entry.status = new_status
        entry.completed_at = date.today() if new_status else None

        db.session.commit()
        return ListEntrySchema().dump(entry), 200

class Reviews(Resource):
    def post(self):
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        media_id = data.get("media_id")
        rating = data.get("rating")
        text = data.get("text")

        if not media_id or rating is None:
            return {"error": "media_id and rating are required"}, 400

        review = Review.query.filter_by(user_id=user_id, media_id=media_id).first()
        if not review:
            review = Review(
                user_id=user_id,
                media_id=int(media_id),
                rating=int(rating),
                text=text,
                created_at=date.today()
            )
            db.session.add(review)
        else:
            review.rating = int(rating)
            review.text = text

        try:
            db.session.commit()
            return ReviewSchema().dump(review), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 422

class ReviewByMediaID(Resource):
    def delete(self, media_id):
        user_id = int(get_jwt_identity())

        review = Review.query.filter_by(user_id=user_id, media_id=media_id).first()
        if not review:
            return {"error": "Review not found"}, 404

        db.session.delete(review)
        db.session.commit()
        return {}, 204

class FollowUser(Resource):
    def post(self):
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        target_id = data.get("user_id")
        if not target_id:
            return {"error": "user_id is required"}, 400

        target_id = int(target_id)
        if target_id == user_id:
            return {"error": "You cannot follow yourself"}, 400

        existing = Follow.query.filter_by(follower_id=user_id, following_id=target_id).first()
        if existing:
            return FollowSchema().dump(existing), 200

        try:
            follow = Follow(follower_id=user_id, following_id=target_id)
            db.session.add(follow)
            db.session.commit()
            return FollowSchema().dump(follow), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 422

class UnfollowUser(Resource):
    def delete(self, user_id):
        follower_id = int(get_jwt_identity())
        following_id = int(user_id)

        follow = Follow.query.filter_by(follower_id=follower_id, following_id=following_id).first()
        if not follow:
            return {"error": "Follow relationship not found"}, 404

        db.session.delete(follow)
        db.session.commit()
        return {}, 204

api.add_resource(Signup, '/signup', endpoint='signup')
api.add_resource(Login, '/', endpoint='login')
api.add_resource(Me, '/me', endpoint='me')
api.add_resource(Feed, '/feed', endpoint='feed')
api.add_resource(Discover, '/discover', endpoint='discover')
api.add_resource(Profile, '/users/<int:id>', endpoint='profile')
api.add_resource(ToExperience, '/to-experience', endpoint='to_experience')

api.add_resource(ItemByID, '/items/<int:id>', endpoint='item_by_id')
api.add_resource(Items, '/items', endpoint='items')

api.add_resource(ListEntries, '/list', endpoint='list_entries')
api.add_resource(ListEntryByMediaID, '/list/<int:media_id>', endpoint='list_entry_by_media_id')
api.add_resource(ListEntryStatus, '/list/<int:media_id>/status', endpoint='list_entry_status')

api.add_resource(Reviews, '/reviews', endpoint='reviews')
api.add_resource(ReviewByMediaID, '/reviews/<int:media_id>', endpoint='review_by_media_id')

api.add_resource(FollowUser, '/follow', endpoint='follow_user')
api.add_resource(UnfollowUser, '/follow/<int:user_id>', endpoint='unfollow_user')

if __name__ == '__main__':
    app.run(port=5555, debug=True)