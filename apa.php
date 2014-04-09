<?php
require_once "vendor/autoload.php";

use ApaiIO\Configuration\GenericConfiguration;
use ApaiIO\Operations\Search;
use ApaiIO\Operations\SimilarityLookup;
use ApaiIO\ApaiIO;

$conf = new GenericConfiguration();
$conf
    ->setCountry('com')
    ->setAccessKey('AKIAIMR3A6M6YVU5TEOA')
    ->setSecretKey('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')
    ->setAssociateTag('wwwciseufledu-20');

$search = new SimilarityLookup();
$search->setItemId('B000SZK41M');


$apaiIo = new ApaiIO($conf);
$response = $apaiIo->runOperation($search);

echo htmlentities($response, ENT_COMPAT, 'UTF-8');
?>
