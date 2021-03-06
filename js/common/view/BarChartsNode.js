// Copyright 2014-2018, University of Colorado Boulder

/**
 * Visual representation of an equation as a pair of bar charts, for left and right side of equation.
 * An indicator between the charts (equals or not equals) indicates whether they are balanced.
 *
 * This implementation is very brute force, just about everything is recreated each time
 * a coefficient is changed in the equations.  But we have a small number of coefficients,
 * and nothing else is happening in the sim.  So we're trading efficiency for simplicity of
 * implementation.
 *
 * @author Vasily Shakhov (mlearner.com)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var balancingChemicalEquations = require( 'BALANCING_CHEMICAL_EQUATIONS/balancingChemicalEquations' );
  var BarNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/BarNode' );
  var EqualityOperatorNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/EqualityOperatorNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Property} equationProperty the equation that the scales are representing
   * @param {HorizontalAligner} aligner provides layout information to ensure horizontal alignment with other user-interface elements
   * @param {Object} [options]
   * @constructor
   */
  function BarChartsNode( equationProperty, aligner, options ) {

    options = _.extend( {}, options );

    var self = this;
    this.equationProperty = equationProperty; // @private
    this.aligner = aligner; // @private
    this.reactantCountProperties = {}; // @private maps {string} Element.symbol to {Property.<number>} count of the element
    this.productCountProperties = {}; // @private maps {string} Element.symbol to {Property.<number>} counts of the element

    this.reactantBarsParent = new Node(); // @private
    this.productBarsParent = new Node(); // @private

    // @private
    var equalityOperatorNode = new EqualityOperatorNode( equationProperty, {
      center: new Vector2( aligner.getScreenCenterX(), -40 )
    } );

    options.children = [ this.reactantBarsParent, this.productBarsParent, equalityOperatorNode ];
    Node.call( this );

    // Wire coefficients observer to current equation.
    var coefficientsObserver = this.updateCounts.bind( this );
    equationProperty.link( function( newEquation, oldEquation ) {
      self.updateNode();
      if ( oldEquation ) { oldEquation.removeCoefficientsObserver( coefficientsObserver ); }
      newEquation.addCoefficientsObserver( coefficientsObserver );
    } );

    this.mutate( options );
  }

  balancingChemicalEquations.register( 'BarChartsNode', BarChartsNode );

  return inherit( Node, BarChartsNode, {

    // No dispose needed, instances of this type persist for lifetime of the sim.

    /**
     * Update the node when it becomes visible.
     * @param visible
     * @override
     * @public
     */
    setVisible: function( visible ) {
      var wasVisible = this.visible;
      Node.prototype.setVisible.call( this, visible );
      if ( !wasVisible && visible ) {
        this.updateNode();
      }
    },

    /**
     * Updates this node's entire geometry and layout
     * @private
     */
    updateNode: function() {
      if ( this.visible ) {
        var atomCounts = this.equationProperty.get().getAtomCounts();
        this.reactantCountProperties = this.updateBars( this.reactantBarsParent, atomCounts,
          function( atomCount ) { return atomCount.reactantsCount; }, this.aligner.getReactantsBoxCenterX() );
        this.productCountProperties = this.updateBars( this.productBarsParent, atomCounts,
          function( atomCount ) { return atomCount.productsCount; }, this.aligner.getProductsBoxCenterX() );
        this.updateCounts();
      }
    },

    /**
     * Updates one set of bars (reactants or products).
     * @param {Node} parentNode
     * @param {AtomCount[]} atomCounts counts of each atom in the equation
     * @param {function} getCount 1 parameter {AtomCount}, return {number}, either the reactants or products count
     * @param {number} centerX centerX of the chart
     * @param {*} map of {string} Element.symbol to {Property.<number>} number of atoms of that element
     * @private
     */
    updateBars: function( parentNode, atomCounts, getCount, centerX ) {

      // dispose of children before calling removeAllChildren
      parentNode.getChildren().forEach( function( child ) {
        if ( child.dispose() ) {
          child.dispose();
        }
      } );

      parentNode.removeAllChildren(); // remove all the bar nodes

      var countProperties = {}; // clear the map

      var barCenterX = 0;
      for ( var i = 0; i < atomCounts.length; i++ ) {
        var atomCount = atomCounts[ i ];
        // populate the map
        var countProperty = new NumberProperty( getCount( atomCount ), { numberType: 'Integer' } );
        countProperties[ atomCount.element.symbol ] = countProperty;
        // add a bar node
        var barNode = new BarNode( atomCount.element, countProperty, { centerX: barCenterX, bottom: 0 } );
        parentNode.addChild( barNode );
        barCenterX = barNode.centerX + 100;
      }

      parentNode.centerX = centerX;

      return countProperties;
    },

    /**
     * Updates the atom counts for each bar.
     * @private
     */
    updateCounts: function() {
      if ( this.visible ) {
        var atomCounts = this.equationProperty.get().getAtomCounts();
        for ( var i = 0; i < atomCounts.length; i++ ) {
          var atomCount = atomCounts[ i ];
          this.reactantCountProperties[ atomCount.element.symbol ].set( atomCount.reactantsCount );
          this.productCountProperties[ atomCount.element.symbol ].set( atomCount.productsCount );
        }
      }
    }
  } );
} );