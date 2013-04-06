(function() {
    
    // shorthand of box2d functions
    var   b2Vec2 = Box2D.Common.Math.b2Vec2
        , b2AABB = Box2D.Collision.b2AABB
        , b2BodyDef = Box2D.Dynamics.b2BodyDef
        , b2Body = Box2D.Dynamics.b2Body
        , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        , b2Fixture = Box2D.Dynamics.b2Fixture
        , b2World = Box2D.Dynamics.b2World
        , b2MassData = Box2D.Collision.Shapes.b2MassData
        , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
        , b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
        , b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
    })();

	// constant
    var SCALE = 30;
    var DEBUG = true;	// for debug mode on, draw using box2d debug draw

    // global variables
    var canvas, ctx, bodyDef, world, objectList;

	var Init = {
		start : function(id) {
			objectList = new Array();
			this.initCanvas(id);

			// init the world here
			this.initWorld();
			
			
			// Game GameLoop here
			(function run() {
				GameLoop.step();
				// let box2D to calculate the next step of object
				GameLoop.update();
				// Based on the result of box2D, update our object
				if (DEBUG) {
					world.DrawDebugData();
				} else {
					GameLoop.draw();
				}
				requestAnimFrame(run);
			})();
		},
		initCanvas : function(id) {
			canvas = document.getElementById(id);
			ctx = canvas.getContext("2d");
		},
		initWorld : function() {
			world = new b2World(
            	new b2Vec2(0, 10)		//gravity
            	, true                  //allow sleep
         	);
         	

			if (DEBUG) {
				// Draw using box2D for debugging
				var debugDraw = new b2DebugDraw();
				debugDraw.SetSprite(ctx);
				debugDraw.SetDrawScale(30.0);
				debugDraw.SetFillAlpha(0.3);
				debugDraw.SetLineThickness(1.0);
				debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
				world.SetDebugDraw(debugDraw);
			}

         	
		    var ground = new Ground();
	        ground.addToWorld();
	        objectList["ground"] = ground; 
	         
	        
 			var bodyDef = new b2BodyDef;
			var fixDef = new b2FixtureDef;
	        // a ball to test the ground only, delete it later
	        bodyDef.type = b2Body.b2_dynamicBody;
	        bodyDef.position.x = Helper.pxToMeter(640);
	        bodyDef.position.y = Helper.pxToMeter(0);
	        fixDef.shape = new b2CircleShape(Helper.pxToMeter(30))
	        world.CreateBody(bodyDef).CreateFixture(fixDef);
		}
	};
	

	var GameLoop = {
		step : function() {
			var stepRate = 1 / 60;
			world.Step(stepRate, 10, 10);
			world.ClearForces();
		},
		update : function() {
			//TODO: loop through the box2d object, get the calculation value back to our object
			
			// for (var b = world.GetBodyList(); b; b = b.m_next) {
				// if (b.IsActive() && typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null) {
					// shapes[b.GetUserData()].update(box2d.get.bodySpec(b));
				// }
			// }
		},

		draw : function() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (key in objectList) {
				objectList[key].draw();
			}

		}

	};

	// Util functions
	var Helper = {
		pxToMeter : function(px) {
			return px / SCALE;
		},

		meterToPx : function(meter) {
			return meter * SCALE;
		}
	};
	
		var Box2DObject = function(cv) {
		this.x = cv.x;
		this.y = cv.y;
		this.angle = cv.angle;
		this.color = cv.color;
	};
	
	Box2DObject.prototype.update = function(bodySpec) {
		this.x = Helper.meterToPx(bodySpec.x);
		this.y = Helper.meterToPx(bodySpec.y);
		this.angle = bodySpec.angle;
	};
	
	
	var Ground = function () {
		Box2DObject.call(this, {x: 640, y: 700, angle: 0, color: "#cdaf95"});
		this.width = 1280;
		this.height = 40;
	};
	
	Ground.prototype = Box2DObject;

	Ground.prototype.addToWorld = function() {
		var bodyDef = new b2BodyDef;
		var fixDef = new b2FixtureDef;
		//create ground
		bodyDef.type = b2Body.b2_staticBody;
		bodyDef.position.x = Helper.pxToMeter(this.x);
		bodyDef.position.y = Helper.pxToMeter(this.y);
		bodyDef.userData = "ground";
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(Helper.pxToMeter(this.width / 2), Helper.pxToMeter(this.height / 2));
		fixDef.restitution = 0.5;
		world.CreateBody(bodyDef).CreateFixture(fixDef);
	};
	
	Ground.prototype.draw = function() {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);
		ctx.translate(-this.x, -this.y);
		ctx.fillStyle = this.color;
		ctx.fillRect(
		    this.x-(this.width / 2),
		    this.y-(this.height / 2),
		    this.width,
		    this.height
		);
		ctx.restore();
	};

	
	
	Init.start('game_canvas');
	
})();
