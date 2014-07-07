// Copyright 2002-2014, University of Colorado Boulder

/**
 * Base class for all "popups" used in the Game to tell the user whether their guess is balanced or unbalanced.
 * These indicators look like a dialog (aka "popup").
 *
 * @author Vasily Shakhov (mlearner.com)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var FaceNode = require( 'SCENERY_PHET/FaceNode' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );

  // constants
  var FONT = new PhetFont( 18 );
  var FACE_DIAMETER = 75;

  /**
   * @param {Property<Vector2>} locationProperty
   * @param {Bounds2} dragBounds
   * @param {Boolean} smile
   * @param {Function} createContentFunction function that creates the content of the dialog that will appear below the face node
   * @param {*} options
   */
  function GamePopupNode( locationProperty, dragBounds, smile, createContentFunction, options ) {

    options = _.extend( {
      xMargin: 25,
      yMargin: 10
    }, options );

    var self = this;

    // face
    var faceNode = new FaceNode( FACE_DIAMETER );
    if ( !smile ) {
      faceNode.frown();
    }

    // content
    var content = new VBox( {
      children: [ faceNode, createContentFunction.call( this, FONT ) ],
      spacing: 5
    } );

    // background with shadow
    var backgroundBounds = Shape.bounds( content.bounds.dilatedXY( options.xMargin, options.yMargin ) ).bounds;
    var backgroundNode = new Rectangle( backgroundBounds.x, backgroundBounds.y, backgroundBounds.width, backgroundBounds.height,
      { fill: '#c1d8fe', stroke: 'black' } );
    var shadowNode = new Rectangle( backgroundBounds.x + 5, backgroundBounds.y + 5, backgroundBounds.width, backgroundBounds.height,
      { fill: 'rgba(80,80,80,0.12)' } );
    content.centerX = backgroundNode.centerX;

    // move icon (cross) at upper-left
    var CROSS_WIDTH = 30;
    var arrowOptions = {
      tailWidth: 5,
      headWidth: 10,
      headHeight: 8,
      doubleHead: true,
      fill: '#f1f1f2',
      lineWidth: 0
    };
    var cross = new Node();
    cross.addChild( new ArrowNode( -CROSS_WIDTH / 2, 0, CROSS_WIDTH / 2, 0, arrowOptions ) );
    cross.addChild( new ArrowNode( 0, -CROSS_WIDTH / 2, 0, CROSS_WIDTH / 2, arrowOptions ) );
    cross.left = backgroundNode.left + 5;
    cross.top = backgroundNode.top + 5;

    options.cursor = 'pointer';
    options.children = [ shadowNode, backgroundNode, cross, content ];
    Node.call( this, options );

    // Adjust drag bounds to account for dialog dimensions. Origin is at top-center.
    var minWidth = 20; // minimum amount of dialog width that must be visible
    var minHeight = 20; // minimum amount of dialog height that must be visible
    var adjustedDragBounds = new Bounds2(
        dragBounds.minX - this.width / 2 + minWidth, dragBounds.minY - this.height + minHeight,
        dragBounds.maxX + this.width / 2 - minWidth, dragBounds.maxY - minHeight );

    // If location is outside drag bounds, move it inside.
    var x = Math.max( adjustedDragBounds.minX, Math.min( adjustedDragBounds.maxX, locationProperty.get().x ) );
    var y = Math.max( adjustedDragBounds.minY, Math.min( adjustedDragBounds.maxY, locationProperty.get().y ) );
    locationProperty.set( new Vector2( x, y ) );

    // draggable
    this.addInputListener( new MovableDragHandler( { locationProperty: locationProperty, dragBounds: adjustedDragBounds }, ModelViewTransform2.createIdentity() ) );
    locationProperty.link( function() {
      self.centerTop = locationProperty.get();
    } );
  }

  return inherit( Node, GamePopupNode );
} );