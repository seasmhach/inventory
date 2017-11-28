<?php

namespace Controllers;
use Builder\Setting;
use Builder\Currency;
use Seasmhach\Nehemiah\Base;
use Seasmhach\Nehemiah\UserInput;
use Seasmhach\Nehemiah\View\Twig;
use Builder\TransactionInventory;
use Builder\Product as Model;
use Builder\ProductTranslation;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class Product extends Base {
	public function display() {
		$request = Request::createFromGlobals();
		$filter = $request->get('filter', []);

		$dispersed_transaction_inventory = new TransactionInventory;
		$dispersed_transaction_inventory->sum_quantity('dispersed');
		$dispersed_transaction_inventory->inner_join_transaction_by_transaction_id();
		$dispersed_inventory = $dispersed_transaction_inventory->inner_join_inventory_by_inventory_id();
		$dispersed_inventory->list_product_id();
		$dispersed_inventory->group_by_product_id();
		$dispersed_transaction_inventory->where("(transaction.type IN ('sell', 'write-off') OR (transaction.type = 'produce' AND transaction_inventory.related_transaction_inventory IS NOT NULL))");

		$acquired_transaction_inventory = new TransactionInventory;
		$acquired_transaction_inventory->sum_quantity('acquired');
		$acquired_transaction_inventory->inner_join_transaction_by_transaction_id();
		$acquired_inventory = $acquired_transaction_inventory->inner_join_inventory_by_inventory_id();
		$acquired_inventory->list_product_id();
		$acquired_inventory->group_by_product_id();
		$acquired_transaction_inventory->related_transaction_inventory_is_null();

		$average_transaction_inventory = new TransactionInventory;
		$average_transaction_inventory->list("AVG((`net_value` / `exchange_rate`) / `quantity`)", 'average_price');
		$average_transaction_inventory->inner_join_transaction_by_transaction_id();
		$average_inventory = $average_transaction_inventory->inner_join_inventory_by_inventory_id();
		$average_inventory->list_product_id();
		$average_inventory->group_by_product_id();
		$average_transaction_inventory->related_transaction_inventory_is_null();

		$products = new Model;
		$products->all();
		$products->list('(IFNULL(`acquired`, 0) - IFNULL(`dispersed`, 0))', 'available');
		$products->list('NULL', 'translations');
		$products->left_join_by_product_id($dispersed_transaction_inventory, 'dispersed');
		$products->left_join_by_product_id($acquired_transaction_inventory, 'aquired');
		$products->left_join_by_product_id($average_transaction_inventory, 'average');

		if (!empty($filter['name'])) {
			$products->product_name_like($filter['name']);
		}

		if (!empty($filter['sku'])) {
			$products->sku_like($filter['sku']);
		}

		if (!empty($filter['inventory'])) {
			if ($filter['inventory'] === 'in_stock') {
				$products->where('`dispersed` < `acquired`');
			} elseif ($filter['inventory'] === 'out_of_stock') {
				$products->where('`dispersed` >= `acquired`');
			}
		}

		$products->order_by_product_name('ASC');
		$products->select();

		foreach ($products as &$product) {
			$product_translations = new ProductTranslation;
			$product_translations->these('language_id', 'product_name');
			$product_translations->product_id_is($product['product_id']);
			$product_translations->select();
			$product['translations'] = $product_translations;
		}

		return Twig::ff('Semantic', 'display.product.twig', [
			'products' => $products,
			'currency' => Currency::read_by_currency_id(Setting::ff('transaction', 'default_currency', 'USD'), ['symbol']),
			'filter' => $filter,
		]);
	}

	public function compose() {
		return Twig::ff('Semantic', 'compose.product.twig');
	}

	public function edit(int $product_id) {
		return Twig::ff('Semantic', 'compose.product.twig', ['product' => Model::read_by_product_id($product_id)]);
	}

	public function save() {
		$request = Request::createFromGlobals();
		$input = new UserInput;

		if (empty($product_name = $request->get('product_name', ''))) {
			$input->add_error(_("Please specify a name for the product"), 'product_name');
		}

		if (empty($amount = $request->get('amount', 0))) {
			$input->add_error(_("Please specify an amount for this product"), 'amount');
		}

		if ($input->has_errors()) {
			return $input->json_response("Can not add product. Please resove the following issues:");
		}

		$product = new Model();
		$product->set_product_name($product_name);
		$product->set_product_description($request->get('product_description', ''));
		$product->set_unit($request->get('unit', ''));
		$product->set_unit_abbreviation($request->get('unit_abbreviation', ''));
		$product->set_amount($amount);

		if (($product_id = $request->get('product_id', 0))) {
			$product->product_id_is($product_id);
			$product->update();

			return new JsonResponse([
				'action' => 'update',
				'message' => _("The product has been updated successfully"),
			]);
		} else {
			$product_id = $product->insert();

			return new JsonResponse([
				'action' => 'create',
				'message' => _('The product has been successfully created'),
				'set' => [
					'product_id' => $product_id,
				]
			]);
		}
	}
}
