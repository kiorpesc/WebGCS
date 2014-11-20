Feature: UAV Location on Map
  As a UAV pilot
  I want to see where my UAV is on a map
  So that I can keep track of the UAV

  Scenario: No UAVs
    Given There are no UAVs connected
    When I view the page
    Then I should not see a map marker
  
  Scenario: One UAV
    Given There is only one UAV attached
    When I view the page
    Then I should see a map marker at my UAV's current GPS location