<?php
/**
 * @version    CVS: 1.0.0
 * @package    Com_Foo
 * @author     Maikol Ortigueira <maikol@maikol.eu>
 * @copyright  2023 Maikol Ortigueira
 * @license    Licencia Pública General GNU versión 2 o posterior. Consulte LICENSE.txt
 */

namespace Ortiga\Component\Foo\Administrator\Controller;

\defined('_JEXEC') or die;

use Joomla\CMS\MVC\Controller\FormController;

/**
 * Bar controller class.
 *
 * @since  1.0.0
 */
class BarController extends FormController
{
	protected $view_list = 'bars';
}
