Feature: The Contacts List: Online Status
  In order to easily know who I can contact
  As a WhisperIO User
  I want my list of friends to show who is online and who is not online.

  Scenario: Online Status
    Given A User
    When That user goes offline
    Then Contact lists should display that user as offline

  Scenario: Offline Status
    Given A User
    When That user comes online
    Then Contact lists should display that user as online
