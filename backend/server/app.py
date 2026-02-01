from flask import request, make_response, jsonify
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
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

class WhoAmI(Resource):
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user:
            return {"error": "User not found"}, 404
        return UserSchema().dump(user), 200

class Login(Resource):
    def post(self):

        username = request.get_json()['username']
        password = request.get_json()['password']

        user = User.query.filter(User.username == username).first()

        if user and user.authenticate(password):
            token = create_access_token(identity=str(user.id))
            return make_response(jsonify(token=token, user=UserSchema().dump(user)), 200)

        return {'error': '401 Unauthorized'}, 401

api.add_resource(Signup, '/signup', endpoint='signup')
api.add_resource(WhoAmI, '/me', endpoint='me')
api.add_resource(Login, '/login', endpoint='login')

if __name__ == '__main__':
    app.run(port=5555, debug=True)