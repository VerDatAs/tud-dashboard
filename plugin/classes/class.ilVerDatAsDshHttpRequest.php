<?php

use GuzzleHttp\Client as HttpClient;

/**
 * Class ilVerDatAsDshHttpRequest
 *
 * @author Tommy Kubica <tommy.kubica@tu-dresden.de>
 * @ilCtrl_isCalledBy ilVerDatAsDshHttpRequest: ilVerDatAsDshPluginGUI
 */
class ilVerDatAsDshHttpRequest
{
    /**
     * string
     */
    protected $base_uri;

    /**
     * ilVerDatAsDshHttpRequest constructor.
     * @param $base_uri
     */
    public function __construct(string $base_uri)
    {
        $this->base_uri = $base_uri;
    }

    /**
     * @param string $request_url
     * @param array  $request_body
     */
    public function sendPost(string $request_url, array $request_body)
    {
        $client = new HttpClient([
            'base_uri' => $this->base_uri,
            'headers' => ['Content-Type' => 'application/json']
        ]);

        $response = $client->post($request_url, [
            GuzzleHttp\RequestOptions::JSON => $request_body
        ]);

        return $response->getBody();
    }
}
