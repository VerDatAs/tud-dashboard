// TODO Niklas: Remove after integrating in ILIAS
export const initialEvent = {
  courseNode: {
    lcoType: 'ILIAS_COURSE',
    attributes: [
      {
        key: 'objectId',
        value:
          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=crs_503&client_id=default&obj_id_lrs=1690'
      },
      {
        key: 'title',
        value: 'Niklas Testkurs'
      },
      {
        key: 'description',
        value: ''
      },
      {
        key: 'modules',
        value: [
          {
            lcoType: 'ILIAS_MODULE',
            attributes: [
              {
                key: 'objectId',
                value:
                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=lm_507&client_id=default&obj_id_lrs=1698'
              },
              {
                key: 'title',
                value: 'Evaluationsmodul'
              },
              {
                key: 'description',
                value:
                  'Dieses Modul dient der Evaluation des Prototypen der im Rahmen der Arbeit zum Thema "Entwicklung einer Methode zur automatischen'
              },
              {
                key: 'offline',
                value: false
              },
              {
                key: 'chapters',
                value: [
                  {
                    lcoType: 'ILIAS_CHAPTER',
                    attributes: [
                      {
                        key: 'objectId',
                        value:
                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=st_896_507&client_id=default&obj_id_lrs=1698'
                      },
                      {
                        key: 'title',
                        value: 'Evaluation der einzelnen Features'
                      },
                      {
                        key: 'contentPages',
                        value: [
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_897_507&client_id=default&obj_id_lrs=1698'
                              },
                              {
                                key: 'title',
                                value: 'Einführung - Evaluation von Bearbeitungsdauer und Schlagwörtern'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="7c837be0b0763be5dc4d4c21f151d208"><Paragraph Language="en" Characteristic="Attention">Diese Inhaltsseite ist bereits Teil der Evaluation zum Punkt &quot;Bearbeitungsdauer und Schlagwörter&quot;.</Paragraph></PageContent><PageContent PCID="cacd6404d84533e3d8b7c4d3bf6fe00e"><Paragraph Language="en" Characteristic="Standard">Dieses Lernmodul dient der Evaluation des im Rahmen der Arbeit zum Thema &quot;Entwicklung einer Methode zur automatischen Extraktion von Metadaten aus Inhalten des Learning Management Systems ILIAS&quot; entstandenen Prototypen.<br></br><br></br>Die vom Prototypen generierten Metadaten sollen im Rahmen des Projektes <ExtLink Href="https://verdatas.de">VerDatAs</ExtLink> als Grundlage für ein tutorielles Assistenzsystem dienen. Das tutorielle Assistenzsystem soll auf Basis dieser Metadaten personalisierte Unterstützungsvorschläge für Lernende generieren können.<br></br><br></br>Hierfür werden durch den Prototypen folgende Metadaten für jede einzelne Seite dieses Lernmoduls extrahiert oder generiert:</Paragraph></PageContent><PageContent PCID="019e0b1c81a7d4f52c1817e234134335"><Table Language="de" Border="1px" CellSpacing="0px" CellPadding="2px" HorizontalAlign="Left" HeaderRows="1" Class="StandardTable"><TableRow PCID="9b7c336fb2ff938d3288501a03bc0e65"><TableData PCID="ba9f20f8f641b4c0de21d706d27261e7"><PageContent PCID="565d28b6a7376910ec3aa111207b01b9"><Paragraph Language="en" Characteristic="TableContent"><Strong>Titel</Strong></Paragraph></PageContent></TableData><TableData PCID="dd9b24b18091b5b3146dfe090e9e0ebf"><PageContent PCID="03c91a10aaae9513e5c1ee0d2b8b70df"><Paragraph Language="en" Characteristic="Standard">Überschrift des jeweiligen Inhalts (Inhaltsseite, Kapitel oder Lernmodul). Erforderlich, damit das TAS dem Nutzer konkrete Vorschläge mit Überschrift anzeigen kann.</Paragraph></PageContent></TableData></TableRow><TableRow PCID="9977deace805f09200e777ccf4374bbb"><TableData PCID="1c8a5fd1784795c75a055f286c20e2d1"><PageContent PCID="f8bfcd2145e08f9f9cb85ed9f268677c"><Paragraph Language="en" Characteristic="Standard"><Strong>Medien</Strong></Paragraph></PageContent></TableData><TableData PCID="82cf338a832fd23caf19b48fa28cba4c"><PageContent PCID="f54d46d6851c618c79aac2f45bd703c1"><Paragraph Language="en" Characteristic="Standard">Aufzählung der im jeweiligen Inhalt eingebundenen Medien und Ausgabe medienspezifischer Daten (Bildunterschrift, Pfad, Bildinhalt). Nützlich um die Empfehlungen an den Lerntyp anzupassen. Beispielsweise könnten je nach Lerntyp bevorzugt Module mit Audio-, Video- oder Bildinhalten angezeigt werden.</Paragraph></PageContent></TableData></TableRow><TableRow PCID="c8079fa2c1baae34c402e60e1af3eadf"><TableData PCID="8b6f8d94fdccfb9c8e40458e7347890b"><PageContent PCID="c4d70bd9417dcaccc94644403b6e7f1d"><Paragraph Language="en" Characteristic="Standard"><Strong>Aufgaben</Strong></Paragraph></PageContent></TableData><TableData PCID="f611359ce5d90ecd46b034eb46586c19"><PageContent PCID="a2b36cf2c3d5cb34d0a6f1bb214defa2"><Paragraph Language="en" Characteristic="Standard">Auflistung der verwendeten Aufgaben und Ausgabe aufgabenspezifischer Parameter (Aufgabentyp, Fragestellung, Antwortmöglichkeiten, Interaktivität). Diese können von dem TAS genutzt werden, um dem Nutzer Lerninhalte mit geeigneten Übungsaufgaben (optional auch zur Selbstkontrolle) anzuzeigen. Auch die Priorisierung von bestimmten Aufgabentypen, je nach Nutzerprofil ist möglich.</Paragraph></PageContent></TableData></TableRow><TableRow PCID="bdd51d212bfeedcf9224099f7d6626dd"><TableData PCID="4a3f186e129d5c4babae461aac3558ad"><PageContent PCID="5d611968e2397cef38df910badef19e2"><Paragraph Language="en" Characteristic="Standard"><Strong>Bearbeitungsdauer</Strong></Paragraph></PageContent></TableData><TableData PCID="8ed81a7597de0ca3c570cfa98128a6b1"><PageContent PCID="316ecfcab887750ba324c2edc1c72521"><Paragraph Language="en" Characteristic="Standard">Summierte Bearbeitungsdauer (in Minuten) pro Inhaltsseite bzw. Lernmodul. Die geschätzte Bearbeitungsdauer ist für das TAS relevant, um den Umfang eines Lerninhalts abschätzen zu können. Darauf aufbauend, können dann je nach Lernfortschritt des Lernenden, mehr oder weniger umfangreiche Inhalte vorgeschlagen werden.</Paragraph></PageContent></TableData></TableRow><TableRow PCID="ec05d971f4157257077ee87bc186c4d3"><TableData PCID="6bd4581e0cf07bfc0cb5a4ae6e7a9fdc"><PageContent PCID="709da246518ca72f020a827faa81a5ab"><Paragraph Language="en" Characteristic="Standard"><Strong>Schlagwörter</Strong></Paragraph></PageContent></TableData><TableData PCID="3d08b5c96e81f73b7a48cefbb997e993"><PageContent PCID="da3a11922accde98b00ea956785832ba"><Paragraph Language="en" Characteristic="Standard">Beschreiben den jeweiligen Inhalt mit wenigen Worten. Diese sind für das TAS erforderlich, damit Inhalte zunächst thematisch eingeordnet werden und erste Empfehlungen generiert werden können. Für eine weitere Filterung können dann die oben genannten Metadaten zum Einsatz kommen.</Paragraph></PageContent></TableData></TableRow></Table></PageContent><PageContent PCID="985f8be1d260eab498529922b4fe202b"><Paragraph Language="en" Characteristic="Standard">Nun sollen im Rahmen dieser Evaluation folgende Fragen geklärt werden:<br></br>- Wie relevant schätzen Sie die Bedeutung bestimmter Metainformationen für die Generierung von Vorschlägen durch das tutorielle Assistenzsystem ein?<br></br>- Wie zutreffend sind die generierten Metadaten?<br></br>- In welchen Bereichen könnte die Metadatengenerierung noch ausgebaut werden?</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_898_507&client_id=default&obj_id_lrs=1698'
                              },
                              {
                                key: 'title',
                                value: 'ILIAS Aufgaben - Evaluation von ILIAS-Fragen'
                              },
                              {
                                key: 'content',
                                value:
                                  '\n\n<PageObject><PageContent PCID="2439e02e3c5cc3fa669c6a557108564b"><Paragraph Language="en" Characteristic="Attention">Diese Seite dient der Evaluation der gesammelten Metadaten zu dem "ILIAS Fragetyp".</Paragraph></PageContent><PageContent PCID="22f21132ecb2eedff2803d24e1e7e00e"><Paragraph Language="en" Characteristic="Standard">Auf dieser Seite des Evaluationsmoduls ist eine beispielhafte ILIAS Frage eingebaut. Die ausgewählten Antworten sind irrelevant, die Frage dient zu reinen Demonstrationszwecken. Die korrekten Antworten sind "ILIAS" und "Moodle". Die Frage kann durch das Neuladen der Seite erneut beantwortet werden.</Paragraph></PageContent><PageContent PCID="c4588e9c215cd8c27c9f6d51a73eb742"><Question QRef="il__qst_203"/></PageContent></PageObject>\n'
                              },
                              {
                                key: 'interactiveTasks',
                                value: [
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_898_507&client_id=default&ilq_object_id=203&obj_id_lrs=1698'
                                      },
                                      {
                                        key: 'title',
                                        value: 'Learning Management Systeme'
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_899_507&client_id=default&obj_id_lrs=1698'
                              },
                              {
                                key: 'title',
                                value: 'H5P Aufgaben - Evaluation von H5P-Inhalten'
                              },
                              {
                                key: 'content',
                                value:
                                  '\n\n<PageObject><PageContent PCID="5eedd1688af3da8059d4b457e6e6884b"><Paragraph Language="en" Characteristic="Attention">Diese Seite dient der Evaluation der gesammelten Metadaten zu den "H5P Inhalten".</Paragraph></PageContent><PageContent PCID="9462d9eb213a51c93de707345e1575ca"><Paragraph Language="en" Characteristic="Standard">Auf dieser Seite ist ein durch die Erweiterung H5PPageComponent integrierte H5P-Inhalt eingebunden worden. Analog zur vorherigen Seite sind die ausgewählten Antworten irrelevant, die Aufgabe dient zu reinen Demonstrationszwecken. Die korrekten Antworten sind "ILIAS" und "Metadaten".</Paragraph></PageContent><PageContent PCID="e1b68cd0946d0216fb9197bf6935c60b"><Plugged PluginName="H5PPageComponent" PluginVersion="2.1.1"><PluggedProperty Name="content_id">5</PluggedProperty></Plugged></PageContent></PageObject>\n'
                              },
                              {
                                key: 'interactiveTasks',
                                value: [
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_899_507&client_id=default&h5p_object_id=5&obj_id_lrs=1698'
                                      },
                                      {
                                        key: 'title',
                                        value: 'MC3'
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_900_507&client_id=default&obj_id_lrs=1698'
                              },
                              {
                                key: 'title',
                                value: 'Bilder - Evaluation der Texterkennung bei Bildinhalten'
                              },
                              {
                                key: 'content',
                                value:
                                  '\n\n<PageObject><PageContent PCID="aff2ffc68a16703a76b809b12f142392"><Paragraph Language="en" Characteristic="Attention">Diese Seite dient der Evaluation der Texterkennung bei Bildinhalten.</Paragraph></PageContent><PageContent PCID="fd2f67dcdae63c5b4b5f6051294102d5"><Paragraph Language="en" Characteristic="Standard">Auf dieser Seite sind mehrere Bilder mit Textinhalten abgebildet. Die auf den Bildern abgebildeten Objekte sind für diesen Teil der Evaluation irrelevant.</Paragraph></PageContent><PageContent PCID="457e100298f9b76eb65663d5a97f846a"><MediaObject><MediaAlias OriginId="il__mob_1704"/><MediaAliasItem Purpose="Standard"><Layout HorizontalAlign="Left" Width="480" Height="360"/><Caption Align="bottom">Ein Steam Deck welches eine Fehlermeldung anzeigt</Caption></MediaAliasItem></MediaObject></PageContent><PageContent PCID="adb3dea89b84ebb7966ab13917ec8071"><MediaObject><MediaAlias OriginId="il__mob_1705"/><MediaAliasItem Purpose="Standard"><Layout HorizontalAlign="Left" Height="360"/><Caption Align="bottom">Display eines Leergutautomaten in einem Supermarkt</Caption></MediaAliasItem></MediaObject></PageContent><PageContent PCID="d008bf2dbe3c1b52e6c68d4eddd4d7b8"><MediaObject><MediaAlias OriginId="il__mob_1706"/><MediaAliasItem Purpose="Standard"><Layout HorizontalAlign="Left" Width="480"/><Caption Align="bottom">Display einer DHL Packstation mit Fehlermeldung</Caption></MediaAliasItem></MediaObject></PageContent></PageObject>\n'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_901_507&client_id=default&obj_id_lrs=1698'
                              },
                              {
                                key: 'title',
                                value: 'Bilder - Evaluation der Klassifizierung von Bildinhalten'
                              },
                              {
                                key: 'content',
                                value:
                                  '\n\n<PageObject><PageContent PCID="dae409a692d2cfb2e7d76eb0ca3b36f3"><Paragraph Language="en" Characteristic="Attention">Diese Seite dient der Evaluation der Klassifizierung von Bildinhalten.</Paragraph></PageContent><PageContent PCID="8a076c69307349828794069a77456914"><Paragraph Language="en" Characteristic="Standard">Auf dieser Seite sind Bilder mit verschiedensten Inhalten abgebildet. Anhand dieser soll die gewählte Klassifizierungsmethode evaluiert werden.</Paragraph></PageContent><PageContent PCID="4049c6ae3cfa240ef233deba52434531"><MediaObject><MediaAlias OriginId="il__mob_1699"/><MediaAliasItem Purpose="Standard"><Layout HorizontalAlign="Left" Width="480"/><Caption Align="bottom">Landschaft mit Strommasten</Caption></MediaAliasItem></MediaObject></PageContent><PageContent PCID="3075c52369c4a90b8f6c1bde9ddf7c2d"><MediaObject><MediaAlias OriginId="il__mob_1700"/><MediaAliasItem Purpose="Standard"><Layout HorizontalAlign="Left" Width="480"/><Caption Align="bottom">Abbildung von einer Mahlzeit und einem dazugehörigen Getränk</Caption></MediaAliasItem></MediaObject></PageContent><PageContent PCID="f0fb691a41eb525218f14432dda72ac9"><MediaObject><MediaAlias OriginId="il__mob_1701"/><MediaAliasItem Purpose="Standard"><Layout HorizontalAlign="Left" Width="480"/><Caption Align="bottom">Darstellung einer Wolkenlandschaft</Caption></MediaAliasItem></MediaObject></PageContent><PageContent PCID="85b3f6f94590d52cc32a170edae854cd"><MediaObject><MediaAlias OriginId="il__mob_1702"/><MediaAliasItem Purpose="Standard"><Layout HorizontalAlign="Left" Width="480" Height="360"/><Caption Align="bottom">Fahrrad inmitten einer Schneelandschaft</Caption></MediaAliasItem></MediaObject></PageContent><PageContent PCID="8fae8e07b01ffef64c4e499e134efa5f"><MediaObject><MediaAlias OriginId="il__mob_1703"/><MediaAliasItem Purpose="Standard"><Layout HorizontalAlign="Left" Width="480"/><Caption Align="bottom">Meissener Albrechtsburg bei Nacht</Caption></MediaAliasItem></MediaObject></PageContent></PageObject>\n'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            lcoType: 'ILIAS_MODULE',
            attributes: [
              {
                key: 'objectId',
                value:
                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=lm_506&client_id=default&obj_id_lrs=1697'
              },
              {
                key: 'title',
                value: 'Test ILIAS-Lernmodul mit längerem Titel'
              },
              {
                key: 'description',
                value: ''
              },
              {
                key: 'offline',
                value: false
              },
              {
                key: 'chapters',
                value: [
                  {
                    lcoType: 'ILIAS_CHAPTER',
                    attributes: [
                      {
                        key: 'objectId',
                        value:
                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=st_884_506&client_id=default&obj_id_lrs=1697'
                      },
                      {
                        key: 'title',
                        value: 'Test Kapitel 1'
                      },
                      {
                        key: 'contentPages',
                        value: [
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_885_506&client_id=default&obj_id_lrs=1697'
                              },
                              {
                                key: 'title',
                                value: 'Inhaltsseite 1.1'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="3188140d406cf33f87af1a700b30867e"><Paragraph Language="en" Characteristic="Standard">Inhaltsseite 1.1</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_886_506&client_id=default&obj_id_lrs=1697'
                              },
                              {
                                key: 'title',
                                value: 'Inhaltsseite 1.2 mit langem Titel aber ohne Lernaufgaben'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="16396a1e95b14ee686caa5813999d713"><Paragraph Language="en" Characteristic="Standard">Inhaltsseite 1.2</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_887_506&client_id=default&obj_id_lrs=1697'
                              },
                              {
                                key: 'title',
                                value: 'Inhaltsseite 1.3 mit recht langem Titel'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="a8b91ebbd18e62c2b356240917004abe"><Paragraph Language="en" Characteristic="Standard">Inhaltsseite 1.3</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    lcoType: 'ILIAS_CHAPTER',
                    attributes: [
                      {
                        key: 'objectId',
                        value:
                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=st_888_506&client_id=default&obj_id_lrs=1697'
                      },
                      {
                        key: 'title',
                        value: 'Test Kapitel 2 mit recht langer Beschreibung aber ohne Lernaufgaben'
                      },
                      {
                        key: 'contentPages',
                        value: [
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_889_506&client_id=default&obj_id_lrs=1697'
                              },
                              {
                                key: 'title',
                                value: 'Inhaltsseite 2.1'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="ea6fbba9896fe48c6aa868ca505d92aa"><Paragraph Language="en" Characteristic="Standard">Inhaltsseite 2.1</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_890_506&client_id=default&obj_id_lrs=1697'
                              },
                              {
                                key: 'title',
                                value: 'Inhaltsseite 2.2'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="8b8b7eb062f8e85e109aec4ad2097a2b"><Paragraph Language="en" Characteristic="Standard">Inhaltsseite 2.2</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    lcoType: 'ILIAS_CHAPTER',
                    attributes: [
                      {
                        key: 'objectId',
                        value:
                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=st_891_506&client_id=default&obj_id_lrs=1697'
                      },
                      {
                        key: 'title',
                        value: 'Test Kapitel 3 mit Lernaufgaben'
                      },
                      {
                        key: 'contentPages',
                        value: [
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_892_506&client_id=default&obj_id_lrs=1697'
                              },
                              {
                                key: 'title',
                                value: 'Inhaltsseite 3.1'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="3362d37ae0b5bc0cb09320b760e44961"><Paragraph Language="en" Characteristic="Standard">Inhaltsseite 3.1</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_893_506&client_id=default&obj_id_lrs=1697'
                              },
                              {
                                key: 'title',
                                value: 'Inhaltsseite 3.2'
                              },
                              {
                                key: 'content',
                                value:
                                  '\n\n<PageObject><PageContent PCID="107f512849a4ab603ad659223ad0ee48"><Question QRef="il__qst_201"/></PageContent></PageObject>\n'
                              },
                              {
                                key: 'interactiveTasks',
                                value: [
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_893_506&client_id=default&ilq_object_id=201&obj_id_lrs=1697'
                                      },
                                      {
                                        key: 'title',
                                        value: 'Test ILIAS Question'
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_894_506&client_id=default&obj_id_lrs=1697'
                              },
                              {
                                key: 'title',
                                value: 'Inhaltsseite 3.3'
                              },
                              {
                                key: 'content',
                                value:
                                  '\n\n<PageObject><PageContent PCID="132d4d9c9f07d29cf23af6cb74c48cef"><Plugged PluginName="H5PPageComponent" PluginVersion="2.1.2"><PluggedProperty Name="content_id">202</PluggedProperty></Plugged></PageContent></PageObject>\n'
                              },
                              {
                                key: 'interactiveTasks',
                                value: [
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_894_506&client_id=default&h5p_object_id=202&obj_id_lrs=1697'
                                      },
                                      {
                                        key: 'title',
                                        value: 'Test H5P Question'
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_895_506&client_id=default&obj_id_lrs=1697'
                              },
                              {
                                key: 'title',
                                value: 'Inhaltsseite 3.4'
                              },
                              {
                                key: 'content',
                                value:
                                  '\n\n<PageObject><PageContent PCID="2c4ca7929037f8d29eb7fd9a596bde14"><Paragraph Language="en" Characteristic="Standard">Auf dieser Inhaltsseite ist sowohl eine ILIAS-Aufgabe als auch eine H5P-Aufgabe eingebunden.</Paragraph></PageContent><PageContent PCID="84d599303ff36d9f96dfbacc8fd8d112"><Question QRef="il__qst_202"/></PageContent><PageContent PCID="10afe352408e855cb21152cfba720080"><Plugged PluginName="H5PPageComponent" PluginVersion="2.1.2"><PluggedProperty Name="content_id">203</PluggedProperty></Plugged></PageContent></PageObject>\n'
                              },
                              {
                                key: 'interactiveTasks',
                                value: [
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_895_506&client_id=default&ilq_object_id=202&obj_id_lrs=1697'
                                      },
                                      {
                                        key: 'title',
                                        value: 'Test ILIAS Question Nummer 2'
                                      }
                                    ]
                                  },
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_895_506&client_id=default&h5p_object_id=203&obj_id_lrs=1697'
                                      },
                                      {
                                        key: 'title',
                                        value: 'Test H5P Question Nummer 2'
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            lcoType: 'ILIAS_MODULE',
            attributes: [
              {
                key: 'objectId',
                value:
                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=lm_505&client_id=default&obj_id_lrs=1695'
              },
              {
                key: 'title',
                value: 'Verschachteltes ILIAS Lernmodul mit Fragen'
              },
              {
                key: 'description',
                value: ''
              },
              {
                key: 'offline',
                value: false
              },
              {
                key: 'chapters',
                value: [
                  {
                    lcoType: 'ILIAS_CHAPTER',
                    attributes: [
                      {
                        key: 'objectId',
                        value:
                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=st_866_505&client_id=default&obj_id_lrs=1695'
                      },
                      {
                        key: 'title',
                        value: 'Chapter 1'
                      },
                      {
                        key: 'contentPages',
                        value: [
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_867_505&client_id=default&obj_id_lrs=1695'
                              },
                              {
                                key: 'title',
                                value: 'Introduction to Chapter 1'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="7e1eee8fa6bdee358f070b150f50192b"><Paragraph Language="en" Characteristic="Standard">This is an example text for the content page &quot;Introduction to Chapter 1&quot;.</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_869_505&client_id=default&obj_id_lrs=1695'
                              },
                              {
                                key: 'title',
                                value: 'Introduction to Chapter 1.1'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="8e548f4bded2f3046a54526a26c90dcf"><Paragraph Language="en" Characteristic="Standard">This is an example text for the content page &quot;Introduction to Chapter 1.1&quot;.</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_870_505&client_id=default&obj_id_lrs=1695'
                              },
                              {
                                key: 'title',
                                value: 'Chapter 1.1 Content'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="a779f013fcb803752ea01ce95bf15384"><Paragraph Language="en" Characteristic="Standard">This is an example text for the content page &quot;Chapter 1.1 Content&quot;.</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_871_505&client_id=default&obj_id_lrs=1695'
                              },
                              {
                                key: 'title',
                                value: 'Summary Chapter 1.1'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="e3975447edc531896f36911abd834716"><Paragraph Language="en" Characteristic="Standard">This is an example text for the content page &quot;Summary Chapter 1.1&quot;.</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_873_505&client_id=default&obj_id_lrs=1695'
                              },
                              {
                                key: 'title',
                                value: 'Content Page of Chapter 1.2'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="af61daf0d398ac6b423666f8d0049ccb"><Paragraph Language="en" Characteristic="Standard">This is an example text for the content page &quot;Content Page of Chapter 1.2&quot;.</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    lcoType: 'ILIAS_CHAPTER',
                    attributes: [
                      {
                        key: 'objectId',
                        value:
                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=st_874_505&client_id=default&obj_id_lrs=1695'
                      },
                      {
                        key: 'title',
                        value: 'Chapter 2 mit Lernaufgaben (sowohl H5P als auch ILIAS)'
                      },
                      {
                        key: 'contentPages',
                        value: [
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_875_505&client_id=default&obj_id_lrs=1695'
                              },
                              {
                                key: 'title',
                                value: 'Content Page 2.1 (H5P Question)'
                              },
                              {
                                key: 'content',
                                value:
                                  '\n\n<PageObject><PageContent PCID="1be101b26363fffe94be3eb8192317a4"><Paragraph Language="en" Characteristic="Standard">This is an example text for the content page "Content Page 2.1".</Paragraph></PageContent><PageContent PCID="97449d8851e8a9115f1dda25b36712ad"><Plugged PluginName="H5PPageComponent" PluginVersion="2.1.2"><PluggedProperty Name="content_id">198</PluggedProperty></Plugged></PageContent></PageObject>\n'
                              },
                              {
                                key: 'interactiveTasks',
                                value: [
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_875_505&client_id=default&h5p_object_id=198&obj_id_lrs=1695'
                                      },
                                      {
                                        key: 'title',
                                        value: 'Test einer H5P-MC Frage'
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_876_505&client_id=default&obj_id_lrs=1695'
                              },
                              {
                                key: 'title',
                                value: 'Content Page 2.2 (ILIAS Question)'
                              },
                              {
                                key: 'content',
                                value:
                                  '\n\n<PageObject><PageContent PCID="0cf7741880a8fbc5d014ffd49740b7d1"><Paragraph Language="en" Characteristic="Standard">This is an example text for the content page "Content Page 2.2".</Paragraph></PageContent><PageContent PCID="de3ed68b716194deba5ea07b261fef62"><Question QRef="il__qst_198"/></PageContent></PageObject>\n'
                              },
                              {
                                key: 'interactiveTasks',
                                value: [
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_876_505&client_id=default&ilq_object_id=198&obj_id_lrs=1695'
                                      },
                                      {
                                        key: 'title',
                                        value: 'ILIAS Test Question (MC)'
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_878_505&client_id=default&obj_id_lrs=1695'
                              },
                              {
                                key: 'title',
                                value: 'Content Page 2.3.1 (Media)'
                              },
                              {
                                key: 'content',
                                value:
                                  '\n\n<PageObject><PageContent PCID="9590e5afae9dd06c8cab6538c927130a"><Paragraph Language="en" Characteristic="Standard">This is an example text for the content page "Content Page 2.3.1".</Paragraph></PageContent><PageContent PCID="aa0b2a5d492e7f8af1421a85e25277a2"><Plugged PluginName="H5PPageComponent" PluginVersion="2.1.2"><PluggedProperty Name="content_id">199</PluggedProperty></Plugged></PageContent><PageContent PCID="f7318286d505092ba035b35627130fdf"><Plugged PluginName="H5PPageComponent" PluginVersion="2.1.2"><PluggedProperty Name="content_id">200</PluggedProperty></Plugged></PageContent><PageContent PCID="6dff87bb87035fe26d9fbb10e986fe16"><Question QRef="il__qst_199"/></PageContent><PageContent PCID="6d76e7fdf8a9ea7b721b0972387684ab"><Question QRef="il__qst_200"/></PageContent></PageObject>\n'
                              },
                              {
                                key: 'interactiveTasks',
                                value: [
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_878_505&client_id=default&ilq_object_id=199&obj_id_lrs=1695'
                                      },
                                      {
                                        key: 'title',
                                        value: 'Test ILIAS Multiple Choice Question with Multiple Answers'
                                      }
                                    ]
                                  },
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_878_505&client_id=default&ilq_object_id=200&obj_id_lrs=1695'
                                      },
                                      {
                                        key: 'title',
                                        value: 'Test Cloze Question'
                                      }
                                    ]
                                  },
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_878_505&client_id=default&h5p_object_id=199&obj_id_lrs=1695'
                                      },
                                      {
                                        key: 'title',
                                        value: 'Test H5P MC Aufgabe'
                                      }
                                    ]
                                  },
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_878_505&client_id=default&h5p_object_id=200&obj_id_lrs=1695'
                                      },
                                      {
                                        key: 'title',
                                        value: 'Test'
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_879_505&client_id=default&obj_id_lrs=1695'
                              },
                              {
                                key: 'title',
                                value: 'Content Page 2.3.2 (Combined multiple H5P & ILIAS Questions)'
                              },
                              {
                                key: 'content',
                                value:
                                  '\n\n<PageObject><PageContent PCID="5fbff373aca919eba29c03db7e9ccec1"><Paragraph Language="en" Characteristic="Standard">This is an example text for the content page "Content Page 2.3.2".</Paragraph></PageContent><PageContent PCID="87bb97b8c3fec51403625821acf39bbd"><MediaObject><MediaAlias OriginId="il__mob_1696"/><MediaAliasItem Purpose="Standard"><Layout HorizontalAlign="Left"/></MediaAliasItem></MediaObject></PageContent><PageContent PCID="6dcfb2facfc5d7ead7cb7fe7fe23e01e"><Section Characteristic="Block" PCID="b1178da628d0b626cde825b612e386d7"><PageContent PCID="58a359d65abcda3c8b21e8fda5d4c70a"><Paragraph Language="en" Characteristic="Standard">This is an example section in ILIAS.</Paragraph></PageContent></Section></PageContent><PageContent PCID="532b4b8a54c47e913e04a12dc138e26c"><Paragraph Language="en" ShowLineNumbers="y" Characteristic="Code">return true;</Paragraph></PageContent><PageContent PCID="d8507ea6e3d59e3b836c95eae2efb151"><Plugged PluginName="H5PPageComponent" PluginVersion="2.1.2"><PluggedProperty Name="content_id">201</PluggedProperty></Plugged></PageContent></PageObject>\n'
                              },
                              {
                                key: 'interactiveTasks',
                                value: [
                                  {
                                    lcoType: 'ILIAS_INTERACTIVE_TASK',
                                    attributes: [
                                      {
                                        key: 'objectId',
                                        value:
                                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_879_505&client_id=default&h5p_object_id=201&obj_id_lrs=1695'
                                      },
                                      {
                                        key: 'title',
                                        value: 'Just another H5P MC Question'
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    lcoType: 'ILIAS_CHAPTER',
                    attributes: [
                      {
                        key: 'objectId',
                        value:
                          'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=st_880_505&client_id=default&obj_id_lrs=1695'
                      },
                      {
                        key: 'title',
                        value: 'Chapter 3 (Zusammenfassung)'
                      },
                      {
                        key: 'contentPages',
                        value: [
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_881_505&client_id=default&obj_id_lrs=1695'
                              },
                              {
                                key: 'title',
                                value: 'Content Page 3.1'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="de8613d37c175d14ae32324505d9b682"><Paragraph Language="en" Characteristic="Standard">This is an example text for the content page &quot;Content Page 3.1&quot;.</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          },
                          {
                            lcoType: 'ILIAS_CONTENT_PAGE',
                            attributes: [
                              {
                                key: 'objectId',
                                value:
                                  'http://develop.verdatas.inf.tu-dresden.de:8091/goto.php?target=pg_882_505&client_id=default&obj_id_lrs=1695'
                              },
                              {
                                key: 'title',
                                value: 'Content Page 3.2'
                              },
                              {
                                key: 'content',
                                value:
                                  '<PageObject><PageContent PCID="a1f64d3426164c3bde708fafd4b0126c"><Paragraph Language="en" Characteristic="Standard">This is an example text for the content page &quot;Content Page 3.2&quot;.</Paragraph></PageContent></PageObject>'
                              },
                              {
                                key: 'interactiveTasks',
                                value: []
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        key: 'tests',
        value: []
      }
    ]
  },
  token:
    'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzZWxmIiwic3ViIjoiYTUwZDM4ZDMtOWE3Mi00ODE3LWJjOGMtOTY4ZjY5NmY2ZDEwIiwiZXhwIjoxNjk2NTg1OTA1LCJpYXQiOjE2OTY1ODIzMDUsInJvbGVzIjpbIlNUVURFTlQiXX0.bkhqqkYW0XaFze09e7ltYqsxQ5s-Tfo4thzWHWFw-AE',
  backendUrl: 'http://develop.verdatas.inf.tu-dresden.de:8062',
  canViewOnly: false,
  previewMode: false
}
