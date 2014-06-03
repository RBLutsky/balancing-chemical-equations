// Copyright 2002-2014, University of Colorado Boulder

/**
 * Scene graph for the 'Balancing game' screen.
 *
 * @author Vasily Shakhov (MLearner)
 */

define( function( require ) {
  'use strict';

  // Imports
  var GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var BoxesNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/BoxesNode' );
  var EquationNode = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/equationNode' );
  var BCEConstants = require( 'BALANCING_CHEMICAL_EQUATIONS/common/BCEConstants' );
  var Scoreboard = require( 'VEGAS/Scoreboard' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var HorizontalAligner = require( 'BALANCING_CHEMICAL_EQUATIONS/common/view/HorizontalAligner' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var NotBalancedTerseNode = require( 'BALANCING_CHEMICAL_EQUATIONS/game/view/popup/NotBalancedTerseNode' );
  var NotBalancedVerboseNode = require( 'BALANCING_CHEMICAL_EQUATIONS/game/view/popup/NotBalancedVerboseNode' );
  var BalancedNode = require( 'BALANCING_CHEMICAL_EQUATIONS/game/view/popup/BalancedNode' );
  var BalancedNotSimplifiedNode = require( 'BALANCING_CHEMICAL_EQUATIONS/game/view/popup/BalancedNotSimplifiedNode' );

  // strings
  var newGameString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/newGame' );
  var checkString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/check' );
  var nextString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/next' );
  var tryAgainString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/tryAgain' );
  var showAnswerString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/showAnswer' );


  // Constants
  var BOX_SIZE = new Dimension2( 285, 310 );
  var BOX_SEPARATION = 140; // horizontal spacing between boxes

  /**
   * Constructor.
   *
   * @param {gameModel} gameModel - balancing model object.
   * @constructor
   */
  function GameView( gameModel ) {
    var self = this;

    //Constants
    var BUTTONS_OPTIONS = {
      baseColor: '#00ff99',
      centerX: gameModel.width / 2,
      y: 290
    };

    ScreenView.call( this, {renderer: 'svg'} );

    this.model = gameModel;
    this.audioPlayer = new GameAudioPlayer( gameModel.soundEnabledProperty );
    this.aligner = new HorizontalAligner( BOX_SIZE, BOX_SEPARATION, gameModel.width / 2 );

    // Add a root node where all of the game-related nodes will live.
    this.rootNode = new Node();
    this.addChild( this.rootNode );

    //3 main nodes, start, game and complete
    this.startGameLevelNode = new Node();
    this.gamePlayNode = new Node();
    this.gameCompletedLevelNode = new Node();

    //startGame nodes

    //game nodes
    //scoreboard at the bottom of the screen
    var scoreboard = new Scoreboard(
      gameModel.currentEquationIndexProperty,
      new Property( gameModel.EQUATIONS_PER_GAME ),
      gameModel.currentLevelProperty,
      gameModel.pointsProperty,
      gameModel.elapsedTimeProperty,
      gameModel.timerEnabledProperty,
      function() { gameModel.state = self.model.gameState.START_GAME; },
      {
        startOverButtonText: newGameString,
        centerX: this.aligner.centerXOffset,
        bottom: this.model.height - 20
      }
    );
    this.gamePlayNode.addChild( scoreboard );

    // Equation
    this.equationNode = new EquationNode( this.model.currentEquationProperty, this.model.COEFFICENTS_RANGE, this.aligner, {y: this.model.height - 120} );
    this.gamePlayNode.addChild( this.equationNode );

    // boxes that show molecules corresponding to the equation coefficients
    this.boxesNode = new BoxesNode( this.model.currentEquationProperty, this.model.COEFFICENTS_RANGE, this.aligner, BCEConstants.BOX_COLOR, {y: 20} );
    this.gamePlayNode.addChild( this.boxesNode );

    //buttons check, next, tryAgain, showAnswer
    this.checkButton = new TextPushButton( checkString, _.extend( BUTTONS_OPTIONS, {
      listener: function() {
        self.playGuessAudio();
        self.model.check();
      }
    } ) );
    this.nextButton = new TextPushButton( nextString, _.extend( BUTTONS_OPTIONS, {
      listener: function() {
        self.model.next();
      }
    } ) );
    this.tryAgainButton = new TextPushButton( tryAgainString, _.extend( BUTTONS_OPTIONS, {
      listener: function() {
        self.model.tryAgain();
      }
    } ) );
    this.showAnswerButton = new TextPushButton( showAnswerString, _.extend( BUTTONS_OPTIONS, {
      listener: function() {
        self.model.showAnswer();
      }
    } ) );
    this.gamePlayNode.addChild( this.checkButton );
    this.gamePlayNode.addChild( this.nextButton );
    this.gamePlayNode.addChild( this.tryAgainButton );
    this.gamePlayNode.addChild( this.showAnswerButton );

    //popups
    this.popupNode = null; // looks like a dialog, tells user how they did
    //listeners
    this.showWhyButtonListener = function() {
      self.swapPopups( new NotBalancedVerboseNode( self.model.currentEquationProperty, self.hideWhyButtonListener, self.model.balancedRepresentation, self.aligner ) );
    };
    this.hideWhyButtonListener = function() {
      self.swapPopups( new NotBalancedTerseNode( self.showWhyButtonListener ) );
    };

    //gameCompleted nodes


    //observers

    // Monitor the game state and update the view accordingly.
    gameModel.stateProperty.link( function( state ) {
      /*
       * Call an initializer to handle setup of the view for a specified state.
       * See the gameModel for GameState for the semantics of states and the significance of their names.
       */
      self['init' + state]();
    } );

    //TODO remove
    this.startGame();

  }

  return inherit( ScreenView, GameView, {
    startGame: function() {
      this.rootNode.removeAllChildren();
      this.rootNode.addChild( this.gamePlayNode );
      this.model.currentLevel = 0;
      this.model.startGame();
    },
    initStartGame: function() {
      this.rootNode.removeAllChildren();
      this.rootNode.addChild( this.startGameLevelNode );
    },
    initCheck: function() {
      this.setBalancedHighlightEnabled( false );
      this.setButtonNodeVisible( this.checkButton );
      this.setPopupVisible( false );
    },
    initTryAgain: function() {
      this.setButtonNodeVisible( this.tryAgainButton );
      this.setPopupVisible( true );
    },
    initShowAnswer: function() {
      this.setButtonNodeVisible( this.showAnswerButton );
      this.setPopupVisible( true );
    },
    initNext: function() {
      this.setButtonNodeVisible( this.nextButton );
      this.setPopupVisible( this.model.currentEquation.balancedAndSimplified );
      this.model.currentEquation.balance(); // show the correct answer
    },
    initLevelCompleted: function() {

    },
    /*
     * Turns on/off the highlighting feature that indicates whether the equation is balanced.
     * We need to be able to control this so that a balanced equation doesn't highlight
     * until after the user presses the Check button.
     */
    setBalancedHighlightEnabled: function( enabled ) {
      this.equationNode.setBalancedHighlightEnabled( enabled );
      this.boxesNode.setBalancedHighlightEnabled( enabled );
    },
    /*
     * Make one of the buttons visible.
     * Visibility of the buttons is mutually exclusive.
     */
    setButtonNodeVisible: function( buttonNode ) {
      // hide all button nodes
      this.checkButton.setVisible( false );
      this.tryAgainButton.setVisible( false );
      this.showAnswerButton.setVisible( false );
      this.nextButton.setVisible( false );
      // make one visible
      buttonNode.setVisible( true );
    },
    playGuessAudio: function() {
      //TODO
    },
    /**
     * Controls the visibility of the games results "popup".
     * This tells the user whether their guess is correct or not.
     *
     * @param visible
     */
    setPopupVisible: function( visible ) {
      if ( this.popupNode !== null ) {
        this.gamePlayNode.removeChild( this.popupNode );
        this.popupNode = null;
      }
      if ( visible ) {

        // evaluate the user's answer and create the proper type of node
        var equation = this.model.currentEquation;
        if ( equation.balancedAndSimplified ) {
          this.popupNode = new BalancedNode( this.model.currentPoints );
        }
        else if ( equation.balanced ) {
          this.popupNode = new BalancedNotSimplifiedNode();
        }
        else {
          this.popupNode = new NotBalancedTerseNode( this.showWhyButtonListener );
        }

        this.popupNode.centerX = this.aligner.centerXOffset;
        this.popupNode.bottom = this.checkButton.y - 10;
        /*// Layout, ideally centered between the boxes, but guarantee that buttons are not covered.
         PNodeLayoutUtils.alignInside( popupNode, boxesNode, SwingConstants.CENTER, SwingConstants.CENTER );
         if ( popupNode.getFullBoundsReference().getMaxY() >= checkButton.getFullBoundsReference().getMinY() ) {
         PNodeLayoutUtils.alignInside( popupNode, boxesNode, SwingConstants.BOTTOM, SwingConstants.CENTER );
         }*/

        this.gamePlayNode.addChild( this.popupNode ); // visible and in front
      }
    },
    /*
     * Replaces the current popup with a new popup.
     * This is used for the "Not Balanced" popup, which has terse and verbose versions.
     * The new popup is positioned so that it has the same top-center as the old popup.
     * As an additional constrain, the new popup is guaranteed to be above the Try Again button,
     * so that that buttons is not obscured by the popup.
     */
    swapPopups: function( newPopupNode ) {
      var oldPopupNode = this.popupNode;
      this.gamePlayNode.removeChild( this.popupNode );
      this.popupNode = newPopupNode;

      // align with top-center of old popup
      this.popupNode.centerX = oldPopupNode.centerX;
      this.popupNode.y = oldPopupNode.y;

      this.gamePlayNode.addChild( this.popupNode );
    }
  } );
} )
;
