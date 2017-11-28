<?php

namespace Controllers;
use Seasmhach\Nehemiah\UserInput;
use Seasmhach\Nehemiah\View\Twig;
use Builder\Contact;
use Builder\Country;
use Builder\Product;
use Builder\Currency;
use Builder\Setting;
use Symfony\Component\HttpFoundation\Request;

class Buy extends Transaction {
	public function compose() {
		$contacts = Contact::read_all(['contact_id', 'first_name', 'last_name', 'organization', 'nickname']);
		$currencies = Currency::read_all(['currency_id', 'currency_name']);
		$products = Product::read_all(['product_id', 'product_name', 'amount', 'unit_abbreviation']);
		$countries = Country::read_all();

		return Twig::ff('Semantic', 'compose.buy.twig', [
			'contacts' => $contacts,
			'currencies' => $currencies,
			'products' => $products,
			'countries' => $countries,
			'default_currency' => Setting::ff('transaction', 'default_currency'),
		]);
	}

	public function save() {
		$request = Request::createFromGlobals();
		$input = new UserInput;
		$transaction = [
			'type' => 'buy',
			'transaction_id' => $request->get('transaction_id', 0),
			'contact_id' => $request->get('contact_id', 0),
			'reference' => $request->get('reference', ''),
			'date' => $request->get('data', ''),
			'currency' => $request->get('currency', ''),
			'note' => $request->get('note', ''),
			'requires_attention' => $request->get('requires_attention', 0),
		];

		$this->validate_transaction($transaction, $input);

		if ($input->has_errors()) {
			return $input->json_response(_("Could not save the transaction. Please solve the following issues:"));
		}
	}
}
