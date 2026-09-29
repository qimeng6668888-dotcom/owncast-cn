import { setup } from '../../support/setup.js';
import filterTests from '../../support/filterTests';

setup();

filterTests(['mobile'], () => {
	describe(`Live mobile tests`, () => {
		it('Can visit the page', () => {
			cy.visit('http://localhost:8080');
		});

		it('Mobile chat should be visible in the page flow', () => {
			cy.get('#mobile-inline-chat #chat-container').should('be.visible');
		});

		it('Mobile chat button should not exist', () => {
			cy.get('#mobile-chat-button').should('not.exist');
		});

		it('Mobile chat modal should not exist', () => {
			cy.get('.ant-modal').should('not.exist');
		});

		it('Chat container should be visible', () => {
			cy.get('#chat-container').should('be.visible');
		});

		it('Chat input should be visible', () => {
			cy.get('#chat-input').should('be.visible');
		});

		it('Can send a chat message from the inline mobile chat', () => {
			cy.get('#chat-input-content-editable').type('mobile e2e message{enter}');
			cy.contains('.chat-message_user', 'mobile e2e message').should(
				'be.visible',
			);
		});

		it('Chat user menu should be visible', () => {
			cy.get('#user-menu').should('be.visible');
		});

		it('Click on user menu', () => {
			cy.get('#user-menu').click();
		});

		it('Show change name modal', () => {
			cy.contains('Change name').click();
		});
	});
});
