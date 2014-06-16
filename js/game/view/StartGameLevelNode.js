// Copyright 2002-2014, University of Colorado Boulder

/**
 * Start Game Node, level buttons and settings
 *
 * @author Vasily Shakhov (mlearner.com)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LevelStartButton = require( 'VEGAS/LevelStartButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var SoundToggleButton = require( 'SCENERY_PHET/SoundToggleButton' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TimerToggleButton = require( 'SCENERY_PHET/TimerToggleButton' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var MoleculeFactory = require( 'BALANCING_CHEMICAL_EQUATIONS/common/model/MoleculeFactory' );
  var BCEConstants = require( 'BALANCING_CHEMICAL_EQUATIONS/common/BCEConstants' );

  // images, ordered by level
  var levelImagesConstructors = [
    MoleculeFactory.HCl().imageConstructor,
    MoleculeFactory.H2O().imageConstructor,
    MoleculeFactory.NH3().imageConstructor
  ];

  // strings
  var chooseYourLevelString = require( 'string!BALANCING_CHEMICAL_EQUATIONS/chooseYourLevel' );
  var pattern_0level = require( 'string!BALANCING_CHEMICAL_EQUATIONS/pattern_0level' );

  //CONSTANTS
  var BUTTON_MARGIN = 20;

  // Creates a level selection button
  var createLevelStartButton = function( level, model ) {

    // 'Level N' centered above icon
    var label = new Text( StringUtils.format( pattern_0level, level + 1 ), { font: new PhetFont( 14 ), fontWeight: 'bold' } );
    var image = new levelImagesConstructors[level]( _.extend( BCEConstants.ATOM_OPTIONS, { centerX: label.centerX, top: label.bottom + 20, scale: 2 } ) );
    var icon = new VBox( { children: [ label, image ], spacing: 10 } );

    return new LevelStartButton(
      icon,
      model.EQUATIONS_PER_GAME,
      function() {
        model.currentLevel = level;
        model.state = model.gameState.START_GAME;
      },
      model.bestScores[ level ],
      model.getPerfectScore(),
      {
        backgroundColor: '#f0ffcb',
        buttonWidth: 155,
        buttonHeight: 155
      } );
  };

  /**
   * @param {GameModel} model
   * @constructor
   */
  function SettingsNode( model ) {

    Node.call( this );

    // Title
    var title = new Text( chooseYourLevelString, {
      font: new PhetFont( 36 ),
      y: 70,
      centerX: model.width / 2
    } );
    this.addChild( title );

    //buttons
    var buttons = [];
    for ( var level = model.LEVELS_RANGE.min; level <= model.LEVELS_RANGE.max; level++ ) {
      buttons.push( createLevelStartButton( level, model ) );
    }
    this.addChild( new HBox( {
      children: buttons,
      spacing: 55,
      resize: false,
      y: 140,
      centerX: model.width / 2
    } ) );

    // Timer and Sound controls
    var toggleOptions = { stroke: 'black', cornerRadius: 10 };
    var soundToggleButton = new SoundToggleButton( model.soundEnabledProperty, _.extend( toggleOptions, {x: BUTTON_MARGIN, bottom: model.height - BUTTON_MARGIN} ) );
    this.addChild( soundToggleButton );
    var timerToggleButton = new TimerToggleButton( model.timerEnabledProperty, _.extend( toggleOptions, {x: BUTTON_MARGIN, bottom: soundToggleButton.y - BUTTON_MARGIN / 2} ) );
    this.addChild( timerToggleButton );


    // Reset All button
    var resetButton = new ResetAllButton( {
      listener: function() { model.reset(); },
      right: model.width - BUTTON_MARGIN,
      bottom: model.height - BUTTON_MARGIN
    } );
    this.addChild( resetButton );
  }

  return inherit( Node, SettingsNode );
} );

