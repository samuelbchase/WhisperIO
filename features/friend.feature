Feature: Managing Friends
  In order to be able to talk to others
  As a user
  I want to add and remove friends

  Scenario: Adding a Friend
    Given I am logged In and I want to add a friend
    When I click the "Add Friend" button and I type in my friend's user name
    Then that user should be added to my friends list

   Scenario: Removing a Friend
     Given I am loggin in and want to remove a friend
     When I click the "Remove Friend" button and type in my friend's user name
     Then that user should be removed from my friends list