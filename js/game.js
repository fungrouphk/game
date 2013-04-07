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
				// let box2D to calculate the next step of object
				GameLoop.step();
				// Update our object if needed
				GameLoop.update();
				// Finally, draw on the screen
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

         	
		   
			var ground = new Ground({
				x : 640,
				y : 700,
				width : 1280,
				height : 40,
				angle : 0,
				color : "#8b4513"
			});

	        objectList["ground"] = ground; 


            var car = new Car(
                {
                    width : 200,
                    height : 40,
                    radius : 10,
                    x : 100,
                    velocity : 10
                }
            );
            objectList["car1"] = car; 

            var car = new Car(
                {
                    width : 200,
                    height : 40,
                    radius : 10,
                    x : 1200,
                    velocity : -10
                }
            );
            objectList["car2"] = car; 
            
 			var bodyDef = new b2BodyDef;
			var fixDef = new b2FixtureDef;
	        // a ball to test the ground only, delete it later
	        bodyDef.type = b2Body.b2_dynamicBody;
	        bodyDef.position.x = Helper.pxToMeter(640);
	        bodyDef.position.y = Helper.pxToMeter(0);
	        fixDef.shape = new b2CircleShape(Helper.pxToMeter(30));
	        fixDef.friction = 0.3;
            fixDef.density = 1;
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
		
	var Ground = function (options) {
		this.width = options.width;
		this.height = options.height;
		this.x = options.x;
		this.y = options.y
		this.color = options.color;
		
		var bodyDef = new b2BodyDef;
		var fixDef = new b2FixtureDef;
		//create ground
		bodyDef.type = b2Body.b2_staticBody;
		bodyDef.position.x = Helper.pxToMeter(options.x);
		bodyDef.position.y = Helper.pxToMeter(options.y);
		bodyDef.userData = "ground";
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(Helper.pxToMeter(options.width / 2), Helper.pxToMeter(options.height / 2));
		fixDef.restitution = 0.5;
		this.body = world.CreateBody(bodyDef);
		this.body.CreateFixture(fixDef);
	};
	
	Ground.prototype.draw = function() {
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.fillRect(
		    this.x - (this.width / 2),
		    this.y - (this.height / 2),
		    this.width,
		    this.height
		);
		ctx.restore();
	};
	
	
    Ground.prototype.heightAboveGroundToY = function(heightAboveGround) {
        return canvas.height - this.height + heightAboveGround;
    }
	
	var Car = function (options) {
		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_dynamicBody;
		var fixDef = new b2FixtureDef;
		fixDef.density = 30;
		fixDef.friction = 10;
		fixDef.restitution = 0.1;
		fixDef.shape = new b2CircleShape(Helper.pxToMeter(options.radius));

		var wheel1 = world.CreateBody(bodyDef)
		wheel1.CreateFixture(fixDef);
		var wheel2 = world.CreateBody(bodyDef)
		wheel2.CreateFixture(fixDef);

		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_dynamicBody;
						
		// FIXME: investigate why the y value is wrong here! (now floating on the air...)
		bodyDef.position.Set(Helper.pxToMeter(options.x), Helper.pxToMeter(680 - options.height / 2 - 2 * options.radius));
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(Helper.pxToMeter(options.width / 2), Helper.pxToMeter(options.height / 2));
		var car = world.CreateBody(bodyDef);
		car.CreateFixture(fixDef);

        var myjoint = new b2RevoluteJointDef();
        myjoint.bodyA = car;
        myjoint.bodyB = wheel1;
        myjoint.localAnchorA.Set(-Helper.pxToMeter(options.width / 4), Helper.pxToMeter(options.height / 2));
        myjoint.enableMotor = true;
        myjoint.maxMotorTorque = 10;
        myjoint.motorSpeed = options.velocity;
        world.CreateJoint(myjoint);

        myjoint.bodyA = car;
        myjoint.bodyB = wheel2;
        myjoint.localAnchorA.Set(Helper.pxToMeter(options.width / 4), Helper.pxToMeter(options.height / 2));
        world.CreateJoint(myjoint); 

	};
	
	Car.prototype.draw = function() {

	};

	
	
	
	Init.start('game_canvas');
	
})();
