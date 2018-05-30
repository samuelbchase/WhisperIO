Feature: Deleting Accounts
  In order to maintain my privacy
  As a WhisperIO user
  I want to be able to entirely delete my account.

  Scenario: Deleting your account.
    Given A User oldUser
    When I want to delete my account
    Then The account is entirely removed from the system.

  Scenario: Deleting a nonexistant account.
    Given A User noExist that doesn't exist
    When I want to delete my account that doesn't exist
    Then The account isn't removed, and the system throws an error.