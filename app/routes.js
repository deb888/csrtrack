var path=require('path');
module.exports = function(app, passport, SERVER_SECRET) {

  // default message
  app.get('/', function (req, res) {
   // res.send('<html><body><p>Welcome to the database</p></body></html>');
    
     // res.sendFile(path.join(__dirname, '../dist/LMSPRO/index.html'));
     res.send({
       'got_it':'working'
     })
    
  });

// =========== authenticate login info and generate access token ===============
/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Login
 *     description: Creates a new Login
 *     produces:
 *       - application/json
 *     parameters:
 *       - username: string
 *         password: string
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Login'
 *     responses:
 *       200:
 *         description: Successfully login
 */

  app.post('/login', function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
      if (err) { return next(err); }
      // stop if it fails
      if (!user) { return res.status(401).json({ message: 'Invalid Username of Password' }); }

      req.logIn(user, function(err) {
        // return if does not match
        if (err) { return next(err); }

        // generate token if it succeeds
        const db = {
          updateOrCreate: function(user, cb){
            cb(null, user);
          }
        };
        db.updateOrCreate(req.user, function(err, user){
          if(err) {return next(err);}
          // store the updated information in req.user again
          req.user = {
            id: user.username,
            role:user.role
          };
        });

        // create token
        const jwt = require('jsonwebtoken');
        req.token = jwt.sign({
          id: req.user.id,
        }, SERVER_SECRET, {
          expiresIn: "10h"
        });

        // lastly respond with json
        return res.status(200).json({
          user: req.user,
          token: req.token
        });
      });
    })(req, res, next);
  });

// =============================================================================

// ==================== Allows users to create accounts ========================
// {
//   successRedirect : '/signup/successjson',
//   failureRedirect : '/signup/failurejson',
//   failureFlash : true
//   }
  // app.post('/signup', passport.authenticate('local-signup',function(err, user, info) { ));
  // // return messages for signup users
  // app.get('/signup/successjson', function(req, res) {
  //   console.log(req.user);
    
  //   res.status(200).json({ message: 'Successfully created user' });
  // });

  // app.get('/signup/failurejson', function(req, res) {
  //   res.status(401).json({ message: 'This user already exists' });
  // });
app.post('/signup',function(req, res, next){
  passport.authenticate('local-signup',function(err, user, info) {

    if (err) { return res.status(403).json({ message: 'username Already Taken' }); }
    // stop if it fails
    if (!user) { return res.status(403).json({ message: 'Invalid Username of Password' }); }
    return res.status(200).json({
      user: user,
      message: "Signup successfull"
    });
  })(req, res, next);
});
// =============================================================================

// ================= Protected APIs for authenticated Users ====================

  // get tools and routes
  var expressJwt = require('express-jwt'),
      REST_POST = require('../routes/REST_POST'),
      REST_GET = require('../routes/REST_GET'),
      REST_EDIT = require('../routes/REST_EDIT'),
      REST_DELETE = require('../routes/REST_DELETE');

  // authenticate access token
  const authenticate = expressJwt({secret : SERVER_SECRET});

  // GET, EndPoint:
  // https://127.0.0.1:5000/product/api/all?order={orderby}
  app.get('/product/api/get/all', authenticate, REST_GET.getAllRecords);

  // GET, Endpoint:
  // https://127.0.0.1:5000/product/api/?c={target_column}&q={target_value}&order={orderby}
  app.get('/product/api/get', authenticate, REST_GET.findByColumn);

  // GET, EndPoint:
  // https://127.0.0.1:5000/product/api/search/?c={target_column}&start={start}&end={end}&order={orderby}
  app.get('/product/api/get/search', authenticate, REST_GET.rangeSearch);

  // POST, Endpoint:
  // https://127.0.0.1:5000/product/api/add/?content=1,2,3...
  app.post('/product/api/add', authenticate, REST_POST.addOne);

  // POST, Endpoint:
  // https://127.0.0.1:5000/product/api/add/?content[0]=1,2,3,...&content[1]=1,2,3...
  app.post('/product/api/add/batch/', authenticate, REST_POST.addBatch);

  // EDIT, Endpoint:
  // https://127.0.0.1:5000/product/api/edit/:orderID/?content={}
  app.post('/product/api/edit/:id', authenticate, REST_EDIT);

  // Endpoint: https://127.0.0.1:5000/product/api/delete/?id={orderID}
  app.delete('/product/api/delete/', authenticate, REST_DELETE);

// =============================================================================

}
