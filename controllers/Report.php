<?php

namespace Controllers;
use Seasmhach\Nehemiah\Base;
use Seasmhach\Nehemiah\UserInput;
use Seasmhach\Nehemiah\View\Twig;
use Builder\Report as Model;
use Builder\Language;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Report controller
 */
class Report extends Base {
	/**
	 * Display reports
	 *
	 * @return string Twig generated template
	 */
	public function display() {
		$reports = new Model();
		$reports->inner_join_language_by_language_id();
		$reports->select();

		return Twig::ff('Semantic', 'display.reports.twig', [
			'reports' => $reports,
			'languages' => Language::read_all(),
		]);
	}

	/**
	 * Display report create form
	 *
	 * @return string Twig generated template
	 */
	public function compose() {
		return Twig::ff('Semantic', 'compose.report.twig', [
			'languages' => Language::read_all(),
		]);
	}

	/**
	 * Generate edit template form
	 *
	 * @param  int    $report_id Report ID
	 * @return string            Twig generated template
	 */
	public function edit(int $report_id) {
		return Twig::ff('Semantic', 'compose.report.twig', [
			'report' => Model::read_by_report_id($report_id),
			'languages' => Language::read_all(),
		]);
	}

	/**
	 * Save report
	 *
	 * @return JsonResponse
	 */
	public function save() {
		$request = Request::createFromGlobals();
		$input = new UserInput();

		if (!Language::check_existence_by_language_id($request->get('language_id', ''))) {
			$input->add_error(_("The selected language does not exist"), 'language_id');
		}

		if (($report_id = $request->get('report_id')) && !Model::check_existence_by_report_id($report_id)) {
			$input->add_error(_("The selected report doen not exist"), 'language_id');
		}

		if ($input->has_errors()) {
			return $input->json_response(_("Can not save the report. Please correct the following issues:"));
		}

		$report = new Model();
		$report->set_language_id($request->get('language_id', ''));
		$report->set_descriptive_name($request->get('descriptive_name', ''));
		$report->set_filename($request->get('filename', ''));
		$report->set_markup($request->get('markup', ''));
		$report->set_style($request->get('style', ''));
		$report->set_header($request->get('header', ''));
		$report->set_paper($request->get('paper', ''));
		$report->set_orientation($request->get('orientation', ''));

		if ($report_id) {
			$report->report_id_is($report_id);
			$report->update();

			return new JsonResponse([
				'action' => 'update',
				'message' => _("The report has been successfully updated"),
				'set' => [
					'report_id' => $report_id
				],
			]);
		} else {
			$report->insert();

			return new JsonResponse([
				'action' => 'create',
				'message' => _("The report has been successfully created"),
			]);
		}
	}

	/**
	 * Delete report
	 *
	 * @param  int    $report_id Report ID
	 * @return JsonResponse
	 */
	public function delete(int $report_id) {
		$report = new Model();
		$report->report_id_is($report_id);
		$report->delete();

		return new JsonResponse([
			'action' => 'delete',
			'message' => _("The report has been successfully deleted"),
		]);
	}
}
