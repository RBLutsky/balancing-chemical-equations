// Copyright 2002-2014, University of Colorado Boulder

/**
 * Visual representation of an equation as a pair of bar charts, for left and right side of equation.
 * An indicator between the charts (equals or not equals) indicates whether they are balanced.
 * <p>
 * This implementation is very brute force, just about everything is recreated each time
 * a coefficient is changed in the equations.  But we have a small number of coefficients,
 * and nothing else is happening in the sim.  So we're trading efficiency for simplicity of
 * implementation.
 *
 * @author Vasily Shakhov (mlearner.com)
 */

define( function( require ) {
  'use strict';

// modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var BarNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/BarNode' );
  var EqualsSignNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/EqualsSignNode' );
  var NotEqualsSignNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/NotEqualsSignNode' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * Constructor
   * @param {Equation} equationProperty the equation that the chart is representing
   * @param {HorizontalAligner} aligner provides layout information to ensure horizontal alignment with other user-interface elements
   * @param {Object} options
   */
  function BarChartsNode( equationProperty, aligner, maxY ) {
    var self = this;
    Node.call( this );

    this.maxY = maxY;
    this.aligner = aligner;
    this.equationProperty = equationProperty;

    this.reactantsChartParent = new Node();
    this.addChild( this.reactantsChartParent );

    this.productsChartParent = new Node();
    this.addChild( this.productsChartParent );

    this.equalsSignNode = new EqualsSignNode( equationProperty.get().balanced, 50, 10, 10 );
    this.addChild( this.equalsSignNode );
    this.equalsSignNode.center = new Vector2( aligner.centerXOffset, -42 );


    this.notEqualsSignNode = new NotEqualsSignNode( 50, 10, 10 );
    this.addChild( this.notEqualsSignNode );
    this.notEqualsSignNode.center = new Vector2( aligner.centerXOffset, -42 );

    //if coefficient changes
    var coefficientsObserver = function() {
      self.updateNode();
    };

    // if the equation changes...
    equationProperty.link( function( newEquation, oldEquation ) {
      if ( oldEquation ) {
        oldEquation.removeCoefficientsObserver( coefficientsObserver );
      }
      self.equation = newEquation;
      self.equation.addCoefficientsObserver( coefficientsObserver );
    } );
  }

  return inherit( Node, BarChartsNode, {
    /*
     * Updates this node's entire geometry and layout
     */
    updateNode: function() {
      this.updateChart( this.reactantsChartParent, true /* isReactants */ );
      this.updateChart( this.productsChartParent, false /* isReactants */ );
      this.updateEqualitySign();
      this.updateLayout();
    },
    updateChart: function( parentNode, isReactants ) {
      parentNode.removeAllChildren();
      var x = 0;
      var atomCounts = this.equation.getAtomCounts();

      atomCounts.forEach( function( atomCount ) {
        var count = ( isReactants ? atomCount.reactantsCount : atomCount.productsCount );
        var barNode = new BarNode( atomCount.element, count, {x: x} );
        parentNode.addChild( barNode );
        x = barNode.bounds.maxX + 50;
      } );

      if ( isReactants ) {
        parentNode.centerX = this.aligner.centerXOffset - this.aligner.boxSeparation / 2 - this.aligner.boxSize.width / 2;
      }
      else {
        parentNode.centerX = this.aligner.centerXOffset + this.aligner.boxSeparation / 2 + this.aligner.boxSize.width / 2;
      }

    },
    updateEqualitySign: function() {
      this.equalsSignNode.setVisible( this.equationProperty.get().balanced );
      this.notEqualsSignNode.setVisible( !this.equalsSignNode.visible );
      // highlight
      this.equalsSignNode.setHighlighted( this.equationProperty.get().balanced );
    },
    updateLayout: function() {
      this.bottom = this.maxY;
    }
  } );

} );