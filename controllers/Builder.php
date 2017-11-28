<?php

namespace Controllers;
use Seasmhach\Nehemiah;
use Config\DB;
use Config\Paths;

class Builder extends Nehemiah\Base {
	public function __construct() {
		$this->method_access = [
			'build' => true,
		];
	}

	public function build() {
		$builder = new Nehemiah\Builder(DB::DB);
		$builder->build(Paths::PATH . '/builder');

		return 'gr8';
	}
}
