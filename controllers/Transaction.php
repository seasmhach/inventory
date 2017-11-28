<?php

namespace Controllers;
use Builder\Address;
use Builder\Contact;
use Builder\Currency;
use Seasmhach\Nehemiah\Base;
use Seasmhach\Nehemiah\UserInput;
use Builder\Transaction as Model;

abstract class Transaction extends Base {
	protected function validate_transaction(array $transaction, UserInput $input) {
		if ($transaction['transaction_id'] && !Model::check_existence_by_transaction_id($transaction['transaction_id'])) {
			$input->add_error(_("There's a transaction ID defined but the transaction does not exist (anymore)"));
		}

		if (empty($transaction['contact_id'])) {
			$input->add_error(_("Please select the contact involved in this transaction"), 'contact_id');
		} elseif (!Contact::check_existence_by_contact_id($transaction['contact_id'])) {
			$error->add_error(_("The selected contact does not exist (anymore)"));
		}

		if (isset($transaction['address_id']) && !Address::check_existence_by_address_id($this->address_id)) {
			$input->add_error(_("The selected address does not exist (anymore)"), 'address_id');
		}

		if (empty($transaction['type'])) {
			$input->add_error(_("Please define a transaction type."), 'type');
		}

		if (empty($transaction['currency_id']) || !Currency::check_existence_by_currency_id($transaction['currency_id'])) {
			$input->add_error(_("Please select a valid currency"), 'currency_id');
		}

		if (empty($transaction['date']) || !strtotime($transaction['date'])) {
			//$input->add_error(_("Please specify a transaction date"), 'date');
		}
	}
}
