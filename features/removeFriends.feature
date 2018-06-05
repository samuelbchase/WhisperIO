Feature: Removing Friends
  In order to cut contact with other users
  As a WhisperIO user
  I want WhisperIO remove friends that I don't want to be friends with anymore.

  Scenario: Removing Friends
    Given A User testuser1
    When I want to remove a friend
    Then That friend is removed from my friends list

  Scenario: Removing Friends: Failure
    Given A User testuser1
    When I want to remove a friend that I am not friends with
    Then The friend is not 'removed' or 'added'.

  Scenario: Removing Friends: Nonexistent User
    Given A User testuser1
    When I want to remove a friend that does not exist
    Then That friend is not removed from my list, and the system throws an error.
