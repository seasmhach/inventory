<?php

namespace Controllers;
use Builder\Process;
use Builder\Product;
use Builder\Currency;
use Builder\TransactionInventory;
use Seasmhach\Nehemiah\Base;
use Seasmhach\Nehemiah\View\Twig;
use Builder\Inventory as Model;
use Builder\Setting;

class Inventory extends Base {
	public function display(int $product_id) {
		$dispersed_transaction_inventory = new TransactionInventory;
		$dispersed_transaction_inventory->sum_quantity('dispersed');
		$dispersed_transaction_inventory->inner_join_transaction_by_transaction_id();
		$dispersed_inventory = $dispersed_transaction_inventory->inner_join_inventory_by_inventory_id();
		$dispersed_inventory->list_inventory_id();
		$dispersed_inventory->group_by_inventory_id();
		$dispersed_transaction_inventory->where("(transaction.type IN ('sell', 'write-off') OR (transaction.type = 'produce' AND transaction_inventory.related_transaction_inventory IS NOT NULL))");

		$acquired_transaction_inventory = new TransactionInventory;
		$acquired_transaction_inventory->sum_quantity('acquired');
		$acquired_transaction_inventory->inner_join_transaction_by_transaction_id();
		$acquired_inventory = $acquired_transaction_inventory->inner_join_inventory_by_inventory_id();
		$acquired_inventory->list_inventory_id();
		$acquired_inventory->group_by_inventory_id();
		$acquired_transaction_inventory->related_transaction_inventory_is_null();

		$inventories = new Model;
		$inventories->these('inventory_id', 'distributors_batch_number', 'batch_number');
		$inventories->list("(IFNULL(`acquired`, 0) - IFNULL(`dispersed`, 0))", 'available');
		$product = $inventories->inner_join_product_by_product_id();
		$product->these('amount', 'product_name');
		$transaction_inventory = $inventories->inner_join_transaction_inventory_by_inventory_id();
		$transaction_inventory->list('((net_value / exchange_rate) / quantity)', 'unit_price');
		$transaction_inventory->these('transaction_inventory_id');
		$transaction_inventory->related_transaction_inventory_is_null();
		$transaction = $transaction_inventory->inner_join_transaction_by_transaction_id();
		$transaction->these('date', 'type', 'transaction_id');
		$transaction->order_by_date();
		$contact = $transaction->inner_join_contact_by_contact_id();
		$contact->these('contact_id', 'organization', 'nickname');
		$inventories->left_join_by_inventory_id($dispersed_transaction_inventory, 'dispersed');
		$inventories->left_join_by_inventory_id($acquired_transaction_inventory, 'acquired');
		$inventories->product_id_is($product_id);
		$inventories->select();

		foreach ($inventories as &$inventory) {
			$inventory['documents'] = []; //Document::get($inventory['transaction_id']);
		}

		return Twig::ff('Semantic', 'display.inventory.twig', [
			'inventories' => $inventories,
			'product' => Product::read_by_product_id($product_id),
			'currency' => Currency::read_by_currency_id(Setting::ff('transaction', 'default_currency'), ['symbol']),
			'filter' => [],
		]);
	}

	public function history(int $inventory_id) {

	}
}
