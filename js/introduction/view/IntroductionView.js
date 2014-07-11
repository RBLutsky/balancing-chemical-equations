// Copyright 2002-2014, University of Colorado Boulder

/**
 * Scene graph for the 'Introduction' screen.
 *
 * @author Vasily Shakhov (MLearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var BoxesNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/BoxesNode' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var HorizontalAligner = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/HorizontalAligner' );
  var ToolsComboBox = require( 'BALANCING_CHEMICAL_EQUATIONS/introduction/view/ToolsComboBox' );
  var EquationChoiceNode = require( 'BALANCING_CHEMICAL_EQUATIONS/introduction/view/EquationChoiceNode' );
  var EquationNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/EquationNode' );
  var BCEConstants = require( 'BALANCING_CHEMICAL_EQUATIONS/common/BCEConstants' );
  var BarChartsNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/BarChartsNode' );
  var BalanceScalesNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/BalanceScalesNode' );
  var BalancedRepresentation = require( 'BALANCING_CHEMICAL_EQUATIONS/common/model/BalancedRepresentation' );
  var FaceNode = require( 'SCENERY_PHET/FaceNode' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // constants
  var BOX_SIZE = new Dimension2( 285, 145 );
  var BOX_X_SPACING = 110; // horizontal spacing between boxes

  /**
   * @param {IntroductionModel} model
   * @constructor
   */
  function IntroductionView( model ) {

    var self = this;
    ScreenView.call( this, {renderer: BCEConstants.RENDERER} );

    // aligner for equation
    var horizontalAligner = new HorizontalAligner( BOX_SIZE, BOX_X_SPACING, this.layoutBounds.width / 2, 0, this.layoutBounds.width );

    // 'Tools' combo box, at upper-right
    var comboBoxParent = new Node();
    this.addChild( new ToolsComboBox( model.balanceChoiceProperty, comboBoxParent,
      { right: this.layoutBounds.right - 15, top: this.layoutBounds.top + 15 } ) );

    // boxes that show molecules corresponding to the equation coefficients
    var boxesNode = new BoxesNode( model, horizontalAligner, BCEConstants.BOX_COLOR, { top: 180 } );
    this.addChild( boxesNode );

    // bar charts, above boxes
    var barChartsNode = new BarChartsNode( model.currentEquationProperty, horizontalAligner, boxesNode.top - 10 /* maxY */ );
    this.addChild( barChartsNode );

    // balance scales, above boxes
    var balanceScalesNode = new BalanceScalesNode( model.currentEquationProperty, horizontalAligner, boxesNode.top - 10 /* maxY */ );
    this.addChild( balanceScalesNode );

    // smiley face, top center, shown when equation is balanced
    var faceNode = new FaceNode( 70, { centerX: this.layoutBounds.centerX, top: 15 } );
    this.addChild( faceNode );
    var updateFace = function() {
      faceNode.visible = model.currentEquationProperty.get().balanced;
    };
    model.currentEquationProperty.link( function( newEquation, oldEquation ) {
      if ( oldEquation ) {
        oldEquation.removeCoefficientsObserver( updateFace );
      }
      newEquation.addCoefficientsObserver( updateFace );
    } );

    // interactive equation
    this.addChild( new EquationNode( model.currentEquationProperty, model.COEFFICENTS_RANGE, horizontalAligner, { top: boxesNode.bottom + 20 } ) );

    // control for choosing an equation
    var equationChoiceNode = new EquationChoiceNode( this.layoutBounds.width, model, { bottom: this.layoutBounds.bottom - 10 } );
    this.addChild( equationChoiceNode );

    // Reset All button
    this.addChild( new ResetAllButton( {
      listener: model.reset.bind( model ),
      right: this.layoutBounds.right - 20,
      centerY: equationChoiceNode.centerY,
      scale: 0.8
    } ) );

    // add this last, so that combo box list is on top of everything else
    this.addChild( comboBoxParent );

    model.balanceChoiceProperty.link( function( choice ) {
      barChartsNode.setVisible( choice === BalancedRepresentation.BAR_CHARTS );
      balanceScalesNode.setVisible( choice === BalancedRepresentation.BALANCE_SCALES );
    } );

    // show the answer when running in dev mode, bottom center
    if ( window.phetcommon.getQueryParameter( 'dev' ) ) {
      var answerNode = new Text( '', { font: new PhetFont( 12 ), bottom: equationChoiceNode.top - 5 } );
      this.addChild( answerNode );
      model.currentEquationProperty.link( function( equation ) {
        answerNode.text = equation.getCoefficientsString();
        answerNode.centerX = self.layoutBounds.centerX;
      } );
    }
  }

  return inherit( ScreenView, IntroductionView );
} );
