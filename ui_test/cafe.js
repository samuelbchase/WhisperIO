import { Selector } from 'testcafe'; // first import testcafe selectors
import { ClientFunction } from 'testcafe';
const getPageUrl = ClientFunction(() => window.location.href.toString());

fixture `Getting Started`// declare the fixture
    .page `https://localhost:3000`;  // specify the start page
const emailBox = Selector('#emailBox');
const passwordBox = Selector('#passwordBox');
const loginBox = Selector('#login');
const gbox = Selector('#g-signin2');


//then create a test and place your code there
test('Check email box', async t => {
    await t
        .typeText(emailBox, 'qwe')
        .selectText(emailBox)
        // Use the assertion to check if the actual header text is equal to the expected one
        .expect(emailBox.value).eql('qwe');
});

test('Check Password Box', async t => {
    await t
        .typeText(passwordBox, 'qwe')
        .selectText(passwordBox)
        // Use the assertion to check if the actual header text is equal to the expected one
        .expect(passwordBox.value).eql('qwe');
});

test('Check Password box for deletion', async t => {
    await t
        .typeText(passwordBox, 'qwe')
        .typeText(passwordBox, 'qwe',  { replace: true })
        .selectText(passwordBox)
        // Use the assertion to check if the actual header text is equal to the expected one
        .expect(passwordBox.value).eql('qwe');
});

test('Check Login Box', async t => {
    await t
        .typeText(emailBox, 'qwe')
        .typeText(passwordBox, 'qwe')
        .click(loginBox)
        // Use the assertion to check if the actual header text is equal to the expected one
        .expect(getPageUrl()).contains('https://localhost:3000/main', { timeout: 10000 });
});

test('Check Message Sender Box', async t => {
    await t
        .typeText(emailBox, 'qwe')
        .typeText(passwordBox, 'qwe')
        .click(loginBox)
        .typeText(Selector('#messageSender'), 'Alo!')
        .expect(Selector('#messageSender').value).eql('Alo!');
        // Use the assertion to check if the actual header text is equal to the expected one
});

test('Check Add friend Box', async t => {
    await t
        .setNativeDialogHandler((type, text, url) => {
            switch (type) {
            case 'prompt':
                return 'qwe';
            }
        })

        .typeText(emailBox, 'qwe')
        .typeText(passwordBox, 'qwe')
        .click(loginBox)
        .click(Selector('#addFriendButton'))
        .wait(2000)
        .expect(Selector('.swal-modal').exists).ok();
    // Use the assertion to check if the actual header text is equal to the expected one
});
/*
test('Check Google Box', async t => {
    await t
        .click(gbox)
        // Use the assertion to check if the actual header text is equal to the expected one
        .expect(getPageUrl()).contains('https://localhost:3000/main', { timeout: 10000 });
});
*/