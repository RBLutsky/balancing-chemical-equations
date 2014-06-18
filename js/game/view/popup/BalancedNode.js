// Copyright 2002-2014, University of Colorado Boulder

/**
 * Indicator that an equation is balanced.
 * This looks like a dialog, and contains a smiley face, and check mark for balanced
 *
 * Author: Vasily Shakhov (mlearner.com)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var GamePopupNode = require( 'BALANCING_CHEMICAL_EQUATIONS/game/view/popup/GamePopupNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Image = require( 'SCENERY/nodes/Image' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  var balancedString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/balanced' );
  var pattern0PointsString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/pattern_0points' );

  // images
  var correctImage = require( 'image!BALANCING_CHEMICAL_EQUATIONS/Check-Mark-u2713.png' );

  /**
   * @param {Number} points number of points for answer
   * @constructor
   */
  var BalancedNode = function( points ) {
    GamePopupNode.call( this, true, function( phetFont ) {

      // icon and text
      var hBox = new HBox( {
        children: [
          new Image( correctImage ),
          new Text( balancedString, {font: phetFont} )
        ],
        spacing: 0
      } );

      return new VBox( {
        children: [
          hBox,
          new Text( StringUtils.format( pattern0PointsString, points ), {font: phetFont} ) //points text
        ],
        spacing: 15
      } );
    } );
  };

  return inherit( GamePopupNode, BalancedNode );

} );