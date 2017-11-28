<?php

namespace Controllers;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Seasmhach\Nehemiah\Base;
use Seasmhach\Nehemiah\UserInput;
use Seasmhach\Nehemiah\View\Twig;
use Builder\Contact as Model;
use Builder\Address;
use OutOfBoundsException;

class Contact extends Base {
	/**
	 * Render contact compose form
	 *
	 * @return string Twig rendered template
	 */
	public function compose() {
		return Twig::ff('Semantic', 'compose.contact.twig');
	}

	/**
	 * Display all users.
	 *
	 * @return string Twig generated template
	 */
	public function display() {
		return Twig::ff('Semantic', 'display.contacts.twig', [
			'contacts' => Model::read_all()
		]);
	}

	/**
	 * Render contact edit form.
	 *
	 * @throws OutOfBoundsException When the contact can not be found
	 * @param  int    $contact_id Contact ID
	 * @return string Twig generated template
	 */
	public function edit(int $contact_id) {
		$contact = Model::read_by_contact_id($contact_id);

		if (!count($contact)) {
			throw new OutOfBoundsException("Unable to select contact by ID '$contact_id'.");
		}

		return Twig::ff('Semantic', 'edit.contact.twig', [
			'contact' => $contact,
		]);
	}

	/**
	 * Create or update contact
	 *
	 * @return JsonResponse
	 */
	public function save() {
		$request = Request::createFromGlobals();
		$input = new UserInput;

		if (empty($nickname = $request->get('nickname', null))) {
			$input->add_error(_("Please enter a nickname for this contact."), 'nickname');
		}

		if ($input->has_errors()) {
			return $input->json_response(_("Could not process your input. Please look at the following issues:"));
		}

		$contact = new Model;
		$contact->set_first_name($request->get('first_name', ''));
		$contact->set_last_name($request->get('last_name', ''));
		$contact->set_organization($request->get('organization', ''));
		$contact->set_nickname($nickname);
		$contact->set_phone_mobile($request->get('phone_mobile', ''));
		$contact->set_phone_work($request->get('phone_work', ''));
		$contact->set_phone_home($request->get('phone_home', ''));
		$contact->set_fax($request->get('fax'));
		$contact->set_email_work($request->get('email_work', ''));
		$contact->set_email_home($request->get('email_home', ''));
		$contact->set_description($request->get('description', ''));
		$contact->set_organic_certifier_code($request->get('organic_certifier_code', ''));
		$contact->set_tax_number($request->get('tax_number', ''));
		$contact->set_customer_number($request->get('customer_number', ''));
		$contact->set_website($request->get('website', ''));

		if (($contact_id = $request->get('contact_id', 0))) {
			$contact->contact_id_is($contact_id);
			$contact->update();

			return new JsonResponse([
				'action' => 'update',
				'message' => _("The changes to this contact have been successfully changed."),
			]);
		} else {
			$contact_id = $contact->insert();

			return new JsonResponse([
				'action' => 'create',
				'message' => _("The contact has been successfully created."),
				'set' => [
					'contact_id' => $contact_id,
				]
			]);
		}
	}

	/**
	 * Delete a contact. Foreign key constratins take care of deleting related
	 * records. This method is powerfull and the user should be properly warned!
	 *
	 * @param  int    $contact_id Contact ID
	 * @return JsonResponse
	 */
	public function delete(int $contact_id) {
		$contact = new Model();
		$contact->contact_id_is($contact_id);
		$contact->delete();

		return new JsonResponse([
			'action' => 'delete',
			'message' => _("The contact has been successfully deleted."),
		]);
	}
}
