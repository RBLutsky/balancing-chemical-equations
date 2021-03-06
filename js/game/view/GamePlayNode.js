// Copyright 2014-2018, University of Colorado Boulder

/**
 * Node that contains all of the user-interface elements related to playing game challenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var balancingChemicalEquations = require( 'BALANCING_CHEMICAL_EQUATIONS/balancingChemicalEquations' );
  var BCEConstants = require( 'BALANCING_CHEMICAL_EQUATIONS/common/BCEConstants' );
  var BoxesNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/BoxesNode' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var EquationNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/EquationNode' );
  var FiniteStatusBar = require( 'VEGAS/FiniteStatusBar' );
  var GameFeedbackDialog = require( 'BALANCING_CHEMICAL_EQUATIONS/game/view/GameFeedbackDialog' );
  var HorizontalAligner = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/HorizontalAligner' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ScoreDisplayLabeledNumber = require( 'VEGAS/ScoreDisplayLabeledNumber' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );

  // strings
  var checkString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/check' );
  var nextString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/next' );

  // constants
  var BOX_SIZE = new Dimension2( 285, 340 );
  var BOX_X_SPACING = 140; // horizontal spacing between boxes

  /**
   * @param {GameModel} model
   * @param {GameViewProperties} viewProperties
   * @param {GameAudioPlayer} audioPlayer
   * @param {Bounds2} layoutBounds layout bounds of the parent ScreenView
   * @param {Property.<Bounds2>} visibleBoundsProperty of the parent ScreenView
   * @param {Object} [options]
   * @constructor
   */
  function GamePlayNode( model, viewProperties, audioPlayer, layoutBounds, visibleBoundsProperty, options ) {

    var self = this;
    this.model = model; // @private
    this.audioPlayer = audioPlayer; // @private
    this.layoutBounds = layoutBounds; // @private
    this.aligner = new HorizontalAligner( layoutBounds.width, BOX_SIZE.width, BOX_X_SPACING ); // @private
    this.feedbackDialog = null; // @private game feedback dialog, created on demand

    Node.call( this );

    // status bar
    var statusBar = new FiniteStatusBar( layoutBounds, visibleBoundsProperty, model.pointsProperty, {
      scoreDisplayConstructor: ScoreDisplayLabeledNumber,

      // FiniteStatusBar uses 1-based level numbering, model is 0-based, see #127.
      levelProperty: new DerivedProperty( [ model.levelProperty ], function( level ) { return level + 1; } ),
      challengeIndexProperty: model.currentEquationIndexProperty,
      numberOfChallengesProperty: model.numberOfEquationsProperty,
      elapsedTimeProperty: model.timer.elapsedTimeProperty,
      timerEnabledProperty: viewProperties.timerEnabledProperty,
      font: new PhetFont( 14 ),
      textFill: 'white',
      barFill: 'rgb( 49, 117, 202 )',
      xMargin: 30,
      yMargin: 5,
      startOverButtonOptions: {
        baseColor: 'rgb( 229, 243, 255 )',
        textFill: 'black',
        listener: self.model.newGame.bind( self.model ),
        xMargin: 10,
        yMargin: 5
      }
    } );
    this.addChild( statusBar );

    // @private boxes that show molecules corresponding to the equation coefficients
    this.boxesNode = new BoxesNode( model.currentEquationProperty, model.COEFFICENTS_RANGE, this.aligner,
      BOX_SIZE, BCEConstants.BOX_COLOR, viewProperties.reactantsBoxExpandedProperty, viewProperties.productsBoxExpandedProperty,
      { y: statusBar.bottom + 15 } );
    this.addChild( this.boxesNode );

    // @private equation
    this.equationNode = new EquationNode( this.model.currentEquationProperty, this.model.COEFFICENTS_RANGE, this.aligner );
    this.addChild( this.equationNode );
    this.equationNode.centerY = this.layoutBounds.height - (this.layoutBounds.height - this.boxesNode.bottom) / 2;

    // buttons: Check, Next
    var BUTTONS_OPTIONS = {
      font: new PhetFont( 20 ),
      baseColor: 'yellow',
      centerX: 0,
      bottom: this.boxesNode.bottom
    };
    // @private
    this.checkButton = new TextPushButton( checkString, _.extend( BUTTONS_OPTIONS, {
      listener: function() {
        self.playGuessAudio();
        self.model.check();
      }
    } ) );
    // @private
    this.nextButton = new TextPushButton( nextString, _.extend( BUTTONS_OPTIONS, {
      listener: function() {
        self.model.next();
      }
    } ) );

    // constrain buttons to fit the horizontal space between the boxes
    var buttonsParent = new Node( {
      maxWidth: 0.85 * BOX_X_SPACING,
      children: [ this.checkButton, this.nextButton ]
    } );
    buttonsParent.centerX = this.layoutBounds.centerX;
    buttonsParent.bottom = this.boxesNode.bottom;
    this.addChild( buttonsParent );

    // developer stuff
    if ( phet.chipper.queryParameters.showAnswers ) {

      // display correct coefficient at bottom center of the screen
      var answerNode = new Text( '', { font: new PhetFont( 12 ), bottom: this.layoutBounds.bottom - 5 } );
      this.addChild( answerNode );
      this.model.currentEquationProperty.link( function( equation ) {
        answerNode.text = equation.getCoefficientsString();
        answerNode.centerX = self.layoutBounds.centerX;
      } );

      // skips the current equation
      var skipButton = new TextPushButton( 'Skip', {
        font: new PhetFont( 10 ),
        baseColor: 'red',
        textFill: 'white',
        listener: model.next.bind( model ), // equivalent to 'Next'
        left: this.layoutBounds.left + 4,
        bottom: this.layoutBounds.bottom - 2
      } );
      this.addChild( skipButton );
    }

    // Call an initializer to set up the game for the state.
    model.stateProperty.link( function( state ) {
      var states = model.states;
      if ( state === states.CHECK ) {
        self.initCheck();
      }
      else if ( state === states.TRY_AGAIN ) {
        self.initTryAgain();
      }
      else if ( state === states.SHOW_ANSWER ) {
        self.initShowAnswer();
      }
      else if ( state === states.NEXT ) {
        self.initNext();
      }
    } );

    // Disable 'Check' button when all coefficients are zero.
    var coefficientsSumObserver = function( coefficientsSum ) {
      self.checkButton.enabled = (coefficientsSum > 0);
    };
    model.currentEquationProperty.link( function( newEquation, oldEquation ) {
      if ( oldEquation ) { oldEquation.coefficientsSumProperty.unlink( coefficientsSumObserver ); }
      if ( newEquation ) { newEquation.coefficientsSumProperty.link( coefficientsSumObserver ); }
    } );

    this.mutate( options );
  }

  balancingChemicalEquations.register( 'GamePlayNode', GamePlayNode );

  return inherit( Node, GamePlayNode, {

    // No dispose needed, instances of this type persist for lifetime of the sim.

    // @private
    initCheck: function() {
      this.equationNode.setEnabled( true );
      this.checkButton.visible = true;
      this.nextButton.visible = false;
      this.setFeedbackDialogVisible( false );
      this.setBalancedHighlightEnabled( false );
    },

    // @private
    initTryAgain: function() {
      this.equationNode.setEnabled( false );
      this.checkButton.visible = this.nextButton.visible = false;
      this.setFeedbackDialogVisible( true );
      this.setBalancedHighlightEnabled( false );
    },

    // @private
    initShowAnswer: function() {
      this.equationNode.setEnabled( false );
      this.checkButton.visible = this.nextButton.visible = false;
      this.setFeedbackDialogVisible( true );
      this.setBalancedHighlightEnabled( false );
    },

    // @private
    initNext: function() {

      this.equationNode.setEnabled( false );
      this.checkButton.visible = false;

      var currentEquation = this.model.currentEquationProperty.get();
      this.nextButton.visible = !currentEquation.balancedAndSimplified; // 'Next' button is in the game feedback dialog
      this.setFeedbackDialogVisible( currentEquation.balancedAndSimplified );
      this.setBalancedHighlightEnabled( true );
      currentEquation.balance(); // show the correct answer (do this last!)
    },

    /*
     * Turns on/off the highlighting feature that indicates whether the equation is balanced.
     * We need to be able to control this so that a balanced equation doesn't highlight
     * until after the user has completed a challenge.
     * @private
     */
    setBalancedHighlightEnabled: function( enabled ) {
      this.equationNode.setBalancedHighlightEnabled( enabled );
      this.boxesNode.setBalancedHighlightEnabled( enabled );
    },

    /**
     * Plays a sound corresponding to whether the user's guess is correct or incorrect.
     * @private
     */
    playGuessAudio: function() {
      if ( this.model.currentEquationProperty.get().balancedAndSimplified ) {
        this.audioPlayer.correctAnswer();
      }
      else {
        this.audioPlayer.wrongAnswer();
      }
    },

    /**
     * Controls the visibility of the game feedback dialog.
     * This tells the user whether their guess is correct or not.
     * @param visible
     * @private
     */
    setFeedbackDialogVisible: function( visible ) {
      if ( this.feedbackDialog ) {
        this.removeChild( this.feedbackDialog );
        this.feedbackDialog = null;
      }
      if ( visible ) {
        this.feedbackDialog = new GameFeedbackDialog( this.model, this.aligner,
          { centerX: this.layoutBounds.centerX, top: this.boxesNode.top + 10 } );
        this.addChild( this.feedbackDialog ); // visible and in front
      }
    }
  } );
} );
