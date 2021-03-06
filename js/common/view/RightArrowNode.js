// Copyright 2014-2017, University of Colorado Boulder

/**
 * An arrow that points left to right, from reactants to products.
 * Highlights when the equation is balanced.
 *
 * @author Vasily Shakhov (mlearner.com)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var balancingChemicalEquations = require( 'BALANCING_CHEMICAL_EQUATIONS/balancingChemicalEquations' );
  var BCEConstants = require( 'BALANCING_CHEMICAL_EQUATIONS/common/BCEConstants' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var ARROW_LENGTH = 70;

  /**
   * @param {Property.<Equation>} equationProperty
   * @param {Object} [options]
   * @constructor
   */
  function RightArrowNode( equationProperty, options ) {

    options = _.extend( {
      tailWidth: 15,
      headWidth: 35,
      headHeight: 30
    }, options );

    this.equationProperty = equationProperty; // @private
    this._highlightEnabled = true; // @private

    ArrowNode.call( this, 0, 0, ARROW_LENGTH, 0, options );

    // Wire observer to current equation.
    var self = this;
    var balancedObserver = self.updateHighlight.bind( self );
    equationProperty.link( function( newEquation, oldEquation ) {
      if ( oldEquation ) { oldEquation.balancedProperty.unlink( balancedObserver ); }
      newEquation.balancedProperty.link( balancedObserver );
    } );
  }

  balancingChemicalEquations.register( 'RightArrowNode', RightArrowNode );

  return inherit( ArrowNode, RightArrowNode, {

    // No dispose needed, instances of this type persist for lifetime of the sim.

    // @private Highlights the arrow if the equation is balanced.
    updateHighlight: function() {
      this.fill = ( this.equationProperty.get().balancedProperty.get() && this._highlightEnabled )
        ? BCEConstants.BALANCED_HIGHLIGHT_COLOR : BCEConstants.UNBALANCED_COLOR;
    },

    // @public
    set highlightEnabled( value ) {
      this._highlightEnabled = value;
      this.updateHighlight();
    },

    // @public
    get highlightEnabled() { return this._highlightEnabled; }
  } );
} );
