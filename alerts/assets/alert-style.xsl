<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" doctype-system="about:legacy-compat"/>
  <xsl:template match="*[local-name()='alert']">
   <html>
    <head>
      <title><xsl:value-of select="*[local-name()='info'][1]/*[local-name()='headline']" /></title>
      <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
      <link rel="icon" type="image/x-icon" href="favicon.ico" />
      <meta name="description" content="XWS - Next Generation Warning System"/>	
      <meta name="keywords" content="alert, warning, emergency"/>
      <meta name="country" content="United Kingdom"/>
      <meta name="revisit" content="1 days"/>
      <style>
        body { font-family: monospace; }
        a, a:visited, a:hover, a:active { color: #1d70b8; }
        .map { height:400px; width:100%; }
      </style>
      <!-- This XSL uses an OpenLayers map, described at https://openlayers.org/ -->
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.3.1/css/ol.css" type="text/css" />
      <!--<link rel="stylesheet" href="https://openlayers.org/en/v5.1.3/css/ol.css" type="text/css" />-->
      <!-- The line below is only needed for old environments like Internet Explorer and Android 4.x -->
      <script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=fetch,requestAnimationFrame,Element.prototype.classList,URL"></script>
      <!-- The line below fetches the main source for Open Layers. It is used at the CAP area processing. -->
      <script src="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.3.1/build/ol.js"></script>
      <script src="../assets/map.js"></script>
    </head>
    <body>
<!-- To customize the Web page, insert here the HTML code for a page header  -->
        <!-- CAP Headline -->
        <h1>
          <xsl:value-of select="*[local-name()='info'][1]/*[local-name()='headline']" />
        </h1>
        <div id="map" class="map"></div>
        <!-- <script src="https://cap-sources.s3.amazonaws.com/style-lib/drawShapes.js"></script> -->
        <!-- CAP Elements -->
        <table border="0">
          <th></th>
          <xsl:for-each select="*[local-name()='identifier']">
            <tr valign="top">
              <td width="15%">Identifier:</td>
              <td width="85%" colspan="3"><xsl:value-of select="." /></td>
            </tr>
          </xsl:for-each>
          <xsl:for-each select="*[local-name()='sender']">
            <tr valign="top">
              <td width="15%">Sender:</td>
              <td width="85%" colspan="3"><xsl:value-of select="." /></td>
            </tr>
          </xsl:for-each>
          <xsl:for-each select="*[local-name()='sent']">
            <tr valign="top">
              <td width="15%">Sent:</td>
              <td width="85%" colspan="3"><xsl:value-of select="." /></td>
            </tr>
          </xsl:for-each>
          <xsl:for-each select="*[local-name()='status']">
            <tr valign="top">
              <td width="15%">Status:</td>
              <td width="85%" colspan="3"><xsl:value-of select="." /></td>
            </tr>
          </xsl:for-each>
          <xsl:for-each select="*[local-name()='msgType']">
            <tr valign="top">
              <td width="15%">Message Type:</td>
              <td width="85%" colspan="3"><xsl:value-of select="." /></td>
            </tr>
          </xsl:for-each>
          <xsl:for-each select="*[local-name()='scope']">
            <tr valign="top">
              <td width="15%">Scope:</td>
              <td width="85%" colspan="3"><xsl:value-of select="." /></td>
            </tr>
          </xsl:for-each>
          <xsl:for-each select="*[local-name()='restriction']">
            <tr valign="top">
              <td width="15%">Restriction:</td>
              <td width="85%" colspan="3"><xsl:value-of select="." /></td>
            </tr>
          </xsl:for-each>
          <xsl:for-each select="*[local-name()='addresses']">
            <tr valign="top">
              <td width="15%">Addresses:</td>
              <td width="85%" colspan="3"><xsl:value-of select="." /></td>
            </tr>
          </xsl:for-each>
          <xsl:for-each select="*[local-name()='note']">
            <tr valign="top">
              <td width="15%">Note:</td>
              <td width="85%" colspan="3"><xsl:value-of select="." /></td>
            </tr>
          </xsl:for-each>
          <xsl:for-each select="*[local-name()='references']">
            <tr valign="top">
              <td width="15%">References:</td>
              <td width="85%" colspan="3"><xsl:value-of select="." /></td>
            </tr>
          </xsl:for-each>
          <!-- CAP Info elements -->
          <xsl:for-each select="*[local-name()='info']">
            <xsl:for-each select="*[local-name()='language']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Language:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='category']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Category:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='event']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Event:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='responseType']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Response Type:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='urgency']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Urgency:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='severity']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Severity:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='certainty']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Certainty:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='onset']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Onset:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='expires']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Expires:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='senderName']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Sender Name:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='headline']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Headline:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='description']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Description:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='instruction']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Instruction:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='web']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Web:</td>
                <td width="70%" colspan="2">
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="." />
                    </xsl:attribute>
                    <xsl:value-of select="." />
                  </a>
                </td>
              </tr>
            </xsl:for-each>
            <xsl:for-each select="*[local-name()='contact']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Contact:</td>
                <td width="70%" colspan="2">
                  <xsl:value-of select="." />
                </td>
              </tr>
            </xsl:for-each>
            <!-- CAP Info Parameter elements -->
            <xsl:for-each select="*[local-name()='parameter']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Parameter:</td>
                <td width="70%" colspan="2"></td>
              </tr>
              <xsl:for-each select="*[local-name()='valueName']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Value Name:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="*[local-name()='value']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Value:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
            </xsl:for-each>
            <!-- CAP Info Resource elements -->
            <xsl:for-each select="*[local-name()='resource']">
              <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Resource:</td>
                <td width="70%" colspan="2"></td>
              </tr>
              <xsl:for-each select="*[local-name()='resourceDesc']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Description:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="*[local-name()='mimeType']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">MIME Type:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="*[local-name()='size']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Size:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="*[local-name()='uri']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">URI:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="*[local-name()='derefUri']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Dereferenced</td>
                  <td width="55%">[object not shown]</td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="*[local-name()='digest']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Digest:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
            </xsl:for-each>
            <!-- CAP Info Area elements -->
            <xsl:for-each select="*[local-name()='area']">
               <tr valign="top">
                <td width="15%"></td>
                <td width="15%">Area:</td>
                <td width="70%" colspan="2"></td>
               </tr>
             <xsl:for-each select="*[local-name()='areaDesc']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Description:</td>
                  <td width="55%" id="code">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="*[local-name()='polygon']">
                <script type="text/javascript">
                  drawCapPolygon('<xsl:value-of select="."/>');
                </script>
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Polygon:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="*[local-name()='circle']">
                <script type="text/javascript">
                  drawCapCircle('<xsl:value-of select="."/>');
                </script>
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Circle:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="*[local-name()='geocode']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Geocode:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="*[local-name()='altitude']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Altitude:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="*[local-name()='ceiling']">
                <tr valign="top">
                  <td width="15%"></td>
                  <td width="15%"></td>
                  <td width="15%">Ceiling:</td>
                  <td width="55%">
                    <xsl:value-of select="." />
                  </td>
                </tr>
              </xsl:for-each>
            </xsl:for-each>
          </xsl:for-each>
        </table>
        <!-- To customize the Web page, insert here the HTML code for a page footer  -->
        <script>
          // TODO: Use CAP coords, not the GeoJSON files
          window.XWS.map('map', document.getElementById('code').textContent.trim())
        </script>
     </body>
    </html>
  </xsl:template>
</xsl:stylesheet>