from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from enum import Enum
from datetime import datetime


app = Flask(__name__)
CORS(app)
api = Api(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ma3sync.db'  # Using SQLite for simplicity
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    def __repr__(self):
        return f'<User {self.username}>'

class Route(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    distance = db.Column(db.Float, nullable=False)  # Storing distance in kilometers

    def __repr__(self):
        return f'<Route {self.start} to {self.destination}, {self.distance} km>'

class Bus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bus_number = db.Column(db.String(50), unique=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    make = db.Column(db.String(100), nullable=True)  # Optional: Manufacturer of the bus
    model = db.Column(db.String(100), nullable=True)  # Optional: Model of the bus

    def __repr__(self):
        return f'<Bus {self.bus_number}>'

class TripStatus(Enum):
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    PENDING = "pending"

class Trip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.Enum(TripStatus), default=TripStatus.PENDING)

    # Foreign keys
    bus_id = db.Column(db.Integer, db.ForeignKey('bus.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('route.id'), nullable=False)

    # Relationships
    bus = db.relationship('Bus', backref=db.backref('trips', lazy=True))
    user = db.relationship('User', backref=db.backref('trips', lazy=True))
    route = db.relationship('Route', backref=db.backref('trips', lazy=True))

    def __repr__(self):
        return f'<Trip {self.id} - Status {self.status}>'

class TripReview(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # Assuming a rating system out of 5
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Foreign Key to link reviews to trips
    trip_id = db.Column(db.Integer, db.ForeignKey('trip.id'), nullable=False)
    trip = db.relationship('Trip', backref=db.backref('reviews', lazy=True))

    def __repr__(self):
        return f'<TripReview {self.id} for Trip {self.trip_id}>'

class UserList(Resource):
    def get(self):
        users = User.query.all()
        return [{'id': user.id, 'username': user.username, 'email': user.email} for user in users], 200



# Resource for user registration
class UserRegistration(Resource):
    def post(self):
        # Attempt to get JSON data regardless of Content-Type header
        data = request.get_json(force=True)  # 'force=True' ignores the Content-Type header
        if not data:
            return {'message': 'No input data provided'}, 400

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not all([username, email, password]):
            return {'message': 'Missing data'}, 400

        if User.query.filter_by(username=username).first() is not None:
            return {'message': 'Username already exists'}, 400
        
        if User.query.filter_by(email=email).first() is not None:
            return {'message': 'Email already registered'}, 400

        hashed_password = generate_password_hash(password)
        new_user = User(username=username, email=email, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return {'message': 'User registered successfully'}, 201


class UserLogin(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return {'message': 'Username and password are required'}, 400

        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            return {
                'message': 'Login successful',
                'user': {
                    'id': user.id,  # Return the user's ID
                    'username': user.username  # Return the user's username
                }
            }, 200
        else:
            return {'message': 'Invalid username or password'}, 401

class RouteResource(Resource):
    def post(self):
        data = request.get_json()
        start = data.get('start')
        destination = data.get('destination')
        distance = data.get('distance')

        if not start or not destination or distance is None:
            return {'message': 'Start, destination, and distance are required'}, 400

        if Route.query.filter_by(start=start, destination=destination).first():
            return {'message': 'Route already exists'}, 409

        new_route = Route(start=start, destination=destination, distance=distance)
        db.session.add(new_route)
        db.session.commit()

        return {'message': 'Route added successfully', 'route': {
            'start': start,
            'destination': destination,
            'distance': distance
        }}, 201
    def get(self):
        routes = Route.query.all()
        routes_data = [{'id': route.id, 'start': route.start, 'destination': route.destination, 'distance': route.distance} for route in routes]
        return {'routes': routes_data}, 200

class BusResource(Resource):
    def get(self, bus_id=None):
        if bus_id:
            bus = Bus.query.get(bus_id)
            if not bus:
                return {'message': 'Bus not found'}, 404
            return {
                'id': bus.id,
                'bus_number': bus.bus_number,
                'capacity': bus.capacity,
                'make': bus.make,
                'model': bus.model
            }, 200
        else:
            buses = Bus.query.all()
            return [{
                'id': bus.id,
                'bus_number': bus.bus_number,
                'capacity': bus.capacity,
                'make': bus.make,
                'model': bus.model
            } for bus in buses], 200

    def post(self):
        data = request.get_json()
        bus_number = data.get('bus_number')
        capacity = data.get('capacity')
        make = data.get('make', '')  # Default empty string if not provided
        model = data.get('model', '')

        if not bus_number or capacity is None:
            return {'message': 'Bus number and capacity are required'}, 400

        if Bus.query.filter_by(bus_number=bus_number).first():
            return {'message': 'Bus number already exists'}, 409

        new_bus = Bus(bus_number=bus_number, capacity=capacity, make=make, model=model)
        db.session.add(new_bus)
        db.session.commit()

        return {'message': 'Bus added successfully', 'bus_id': new_bus.id}, 201

    def put(self, bus_id):
        bus = Bus.query.get(bus_id)
        if not bus:
            return {'message': 'Bus not found'}, 404

        data = request.get_json()
        bus.bus_number = data.get('bus_number', bus.bus_number)
        bus.capacity = data.get('capacity', bus.capacity)
        bus.make = data.get('make', bus.make)
        bus.model = data.get('model', bus.model)
        db.session.commit()

        return {'message': 'Bus updated successfully'}, 200

    def delete(self, bus_id):
        bus = Bus.query.get(bus_id)
        if not bus:
            return {'message': 'Bus not found'}, 404

        db.session.delete(bus)
        db.session.commit()

        return {'message': 'Bus deleted successfully'}, 200

class TripResource(Resource):
    def get(self, trip_id=None):
        if trip_id:
            trip = Trip.query.get(trip_id)
            if not trip:
                return {'message': 'Trip not found'}, 404
            return {
                'id': trip.id,
                'status': trip.status.name,
                'bus_id': trip.bus_id,
                'user_id': trip.user_id,
                'route_id': trip.route_id
            }, 200
        else:
            trips = Trip.query.all()
            return [{
                'id': trip.id,
                'status': trip.status.name,
                'bus_id': trip.bus_id,
                'user_id': trip.user_id,
                'route_id': trip.route_id
            } for trip in trips], 200

    def post(self):
        data = request.get_json()
        bus_id = data.get('bus_id')
        user_id = data.get('user_id')
        route_id = data.get('route_id')

        # Check if all required data is provided
        if not all([bus_id, user_id, route_id]):
            return {'message': 'Bus, user, and route IDs are required'}, 400
        
        # Check the current count of trips for the given bus_id
        current_trips_count = Trip.query.filter_by(bus_id=bus_id).count()
        
        # Ensure the bus does not exceed the limit of 14 trips
        if current_trips_count >= 14:
            return {'message': 'This bus has reached the maximum number of trips allowed'}, 400

        # If all checks are passed, create the new trip
        new_trip = Trip(bus_id=bus_id, user_id=user_id, route_id=route_id)
        db.session.add(new_trip)
        db.session.commit()

        return {'message': 'Trip created successfully', 'trip_id': new_trip.id}, 201
    
    def put(self, trip_id):
        trip = Trip.query.get(trip_id)
        if not trip:
            return {'message': 'Trip not found'}, 404

        data = request.get_json()
        new_status = data.get('status')

        if new_status and new_status in TripStatus._member_names_:  # Check if the new status is valid
            trip.status = TripStatus[new_status]
            db.session.commit()
            return {'message': 'Trip status updated successfully', 'new_status': trip.status.name}, 200
        else:
            return {'message': 'Invalid or no new status provided'}, 400

class TripReviewResource(Resource):
    def get(self, trip_id):
        trip = Trip.query.get(trip_id)
        if not trip:
            return {'message': 'Trip not found'}, 404
        reviews = TripReview.query.filter_by(trip_id=trip_id).all()
        return {
            'reviews': [
                {'id': review.id, 'content': review.content, 'rating': review.rating, 'created_at': review.created_at.isoformat()}
                for review in reviews
            ]
        }, 200

    def post(self, trip_id):
        trip = Trip.query.get(trip_id)
        if not trip:
            return {'message': 'Trip not found'}, 404

        data = request.get_json()
        content = data.get('content')
        rating = data.get('rating')

        if not content or rating is None:
            return {'message': 'Content and rating are required'}, 400

        review = TripReview(content=content, rating=rating, trip_id=trip_id)
        db.session.add(review)
        db.session.commit()

        return {
            'message': 'Review added successfully',
            'review': {
                'id': review.id,
                'content': review.content,
                'rating': review.rating
            }
        }, 201

class UserTripsResource(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        trips = Trip.query.filter_by(user_id=user_id).all()
        if not trips:
            return {'message': 'No trips found for this user'}, 404

        return {
            'trips': [
                {
                    'id': trip.id,
                    'status': trip.status.name,
                    'bus_id': trip.bus.bus_number,  # assuming you want to show bus number
                    'route_id': trip.route_id,
                    'route_details': {
                        'start': trip.route.start,
                        'destination': trip.route.destination,
                        'distance': trip.route.distance
                    }
                }
                for trip in trips
            ]
        }, 200

api.add_resource(UserList, '/users')
api.add_resource(UserTripsResource, '/users/<int:user_id>/trips')
api.add_resource(TripReviewResource, '/trips/<int:trip_id>/reviews')
api.add_resource(TripResource, '/trips', '/trips/<int:trip_id>')
api.add_resource(BusResource, '/buses', '/buses/<int:bus_id>')
api.add_resource(UserRegistration, '/register')
api.add_resource(UserLogin, '/login')
api.add_resource(RouteResource, '/routes')


@app.route("/", defaults={'path': ''})
def home(path):
    return {"info": "Welcome to MA3SYNC API"}

if __name__ == "__main__":
    app.run(debug=True, port=6060)
