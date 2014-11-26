Feature: See Current Flight Modes
    As a user
    I want to be able to see the available flight modes
    So that I can choose a mode

Scenario: No UAVs connected
    Given I am viewing the app
    And There are no UAVs connected
    When I click the Flight Modes button
    Then I should not see any flight modes

Scenario: One UAV connected
    Given I am viewing the app
    And I connect a single UAV
    When I click the Flight Modes button
    Then I should see the available flight modes for the current UAV

Scenario: Multiple UAVs connected
    Given I am viewing the app
    And I connect multiple UAVs
    When I click the Flight Modes button
    Then I should see the available flight modes for the current UAV
    
    
Feature: Set Flight Modes
    As a user
    I want to set the flight mode of my UAV
    So that it behaves the way I want

Scenario: One UAV
    Given I am viewing the app
    And I connect a single UAV
    When I click one of the mode buttons
    Then the mode change message should be sent to the UAV

Scenario: Multiple UAVs
    Given I am viewing the app
    And I connect multiple UAVs
    When I click one of the mode buttons
    Then the mode change message should be sent to the correct UAV

Scenario: UAV accepts command
    Given I am viewing the app
    And I connect any number of UAVs
    When I click one of the mode buttons
    And the mode is accepted by the UAV
    Then the displayed mode should update to the new mode

Scenario: UAV rejects command
    Given I am viewing the app
    And I connect any number of UAVs
    When I click one of the mode buttons
    And the mode is rejected by the UAV
    Then the displayed mode should not change