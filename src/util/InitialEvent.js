/**
 * This is a modified version of the original file from https://github.com/pinussilvestrus/postit-js (MIT).
 *
 * Copyright 2020 Niklas Kiefer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * -----
 *
 * Adjustments for Dashboard of the assistance system developed as part of the VerDatAs project
 * Copyright (C) 2022-2024 TU Dresden (Tommy Kubica)
 *
 * In addition to the terms of the MIT license, this file is distributed under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
const courseObjectId = import.meta.env.VITE_COURSE_ID || 'http://localhost:5173/goto.php?target=crs_90&client_id=default&obj_id_lrs=336'
export const localNode = {
  lcoType: 'ILIAS_COURSE',
  objectId: courseObjectId,
  attributes: [
    {
      key: 'title',
      value: 'VerDatAs Demonstrationskurs'
    },
    {
      key: 'modules',
      value: [
        {
          lcoType: 'ILIAS_MODULE',
          objectId: 'http://localhost:5173/goto.php?target=lm_90&client_id=default&obj_id_lrs=339',
          attributes: [
            {
              key: 'title',
              value: 'Wissenswertes aus der Naturwissenschaft'
            },
            {
              key: 'chapters',
              value: [
                {
                  lcoType: 'ILIAS_CHAPTER',
                  objectId: 'http://localhost:5173/goto.php?target=st_48_90&client_id=default&obj_id_lrs=339',
                  attributes: [
                    {
                      key: 'title',
                      value: 'Einführung'
                    },
                    {
                      key: 'contentPages',
                      value: [
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_49_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Einführung in das Lernmodul'
                            },
                            {
                              key: 'interactiveTasks',
                              value: []
                            }
                          ]
                        },
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_50_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Lerntagebuch'
                            },
                            {
                              key: 'interactiveTasks',
                              value: [
                                {
                                  lcoType: 'ILIAS_INTERACTIVE_TASK',
                                  objectId:
                                    'http://localhost:5173/goto.php?target=pg_50_90&client_id=default&h5p_object_id=16&obj_id_lrs=339',
                                  attributes: [
                                    {
                                      key: 'title',
                                      value: 'Lerntagebuch'
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
                  objectId: 'http://localhost:5173/goto.php?target=st_51_90&client_id=default&obj_id_lrs=339',
                  attributes: [
                    {
                      key: 'title',
                      value: 'Quiz zur Naturwissenschaft'
                    },
                    {
                      key: 'contentPages',
                      value: [
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_52_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Quizfragen'
                            },
                            {
                              key: 'interactiveTasks',
                              value: [
                                {
                                  lcoType: 'ILIAS_INTERACTIVE_TASK',
                                  objectId:
                                    'http://localhost:5173/goto.php?target=pg_52_90&client_id=default&h5p_object_id=18&obj_id_lrs=339',
                                  attributes: [
                                    {
                                      key: 'title',
                                      value: 'Quizfragen'
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
                  objectId: 'http://localhost:5173/goto.php?target=st_53_90&client_id=default&obj_id_lrs=339',
                  attributes: [
                    {
                      key: 'title',
                      value: 'Energie aus der Nahrung'
                    },
                    {
                      key: 'contentPages',
                      value: [
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_54_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Energie aus der Nahrung'
                            },
                            {
                              key: 'interactiveTasks',
                              value: []
                            }
                          ]
                        },
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_55_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Lernaufgaben zum Thema Nahrung'
                            },
                            {
                              key: 'interactiveTasks',
                              value: [
                                {
                                  lcoType: 'ILIAS_INTERACTIVE_TASK',
                                  objectId:
                                    'http://localhost:5173/goto.php?target=pg_55_90&client_id=default&h5p_object_id=13&obj_id_lrs=339',
                                  attributes: [
                                    {
                                      key: 'title',
                                      value: 'Lernaufgaben Nahrung'
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
                  objectId: 'http://localhost:5173/goto.php?target=st_56_90&client_id=default&obj_id_lrs=339',
                  attributes: [
                    {
                      key: 'title',
                      value: 'Das Sehvermögen'
                    },
                    {
                      key: 'contentPages',
                      value: [
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_57_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Das Sehvermögen'
                            },
                            {
                              key: 'interactiveTasks',
                              value: []
                            }
                          ]
                        },
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_58_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Lernaufgaben zum Thema Sehvermögen'
                            },
                            {
                              key: 'interactiveTasks',
                              value: [
                                {
                                  lcoType: 'ILIAS_INTERACTIVE_TASK',
                                  objectId:
                                    'http://localhost:5173/goto.php?target=pg_58_90&client_id=default&h5p_object_id=14&obj_id_lrs=339',
                                  attributes: [
                                    {
                                      key: 'title',
                                      value: 'Lernaufgaben Sehvermögen'
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
                  objectId: 'http://localhost:5173/goto.php?target=st_59_90&client_id=default&obj_id_lrs=339',
                  attributes: [
                    {
                      key: 'title',
                      value: 'Der Weg der Luft'
                    },
                    {
                      key: 'contentPages',
                      value: [
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_60_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Der Weg der Luft'
                            },
                            {
                              key: 'interactiveTasks',
                              value: []
                            }
                          ]
                        },
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_61_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Lernaufgaben zum Thema Atmung'
                            },
                            {
                              key: 'interactiveTasks',
                              value: [
                                {
                                  lcoType: 'ILIAS_INTERACTIVE_TASK',
                                  objectId:
                                    'http://localhost:5173/goto.php?target=pg_61_90&client_id=default&h5p_object_id=11&obj_id_lrs=339',
                                  attributes: [
                                    {
                                      key: 'title',
                                      value: 'Lernaufgaben Atmung'
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
                  objectId: 'http://localhost:5173/goto.php?target=st_62_90&client_id=default&obj_id_lrs=339',
                  attributes: [
                    {
                      key: 'title',
                      value: 'Die Kampf- oder Flucht-Reaktion'
                    },
                    {
                      key: 'contentPages',
                      value: [
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_63_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Die Kampf- oder Fluchtreaktion'
                            },
                            {
                              key: 'interactiveTasks',
                              value: []
                            }
                          ]
                        },
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_64_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Lernaufgaben zum Thema endokrines System'
                            },
                            {
                              key: 'interactiveTasks',
                              value: [
                                {
                                  lcoType: 'ILIAS_INTERACTIVE_TASK',
                                  objectId:
                                    'http://localhost:5173/goto.php?target=pg_64_90&client_id=default&h5p_object_id=12&obj_id_lrs=339',
                                  attributes: [
                                    {
                                      key: 'title',
                                      value: 'Lernaufgaben endokrines System'
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
                  objectId: 'http://localhost:5173/goto.php?target=st_65_90&client_id=default&obj_id_lrs=339',
                  attributes: [
                    {
                      key: 'title',
                      value: 'Viren'
                    },
                    {
                      key: 'contentPages',
                      value: [
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_66_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Viren'
                            },
                            {
                              key: 'interactiveTasks',
                              value: []
                            }
                          ]
                        },
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_67_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Lernaufgaben zum Thema Viren'
                            },
                            {
                              key: 'interactiveTasks',
                              value: [
                                {
                                  lcoType: 'ILIAS_INTERACTIVE_TASK',
                                  objectId:
                                    'http://localhost:5173/goto.php?target=pg_67_90&client_id=default&h5p_object_id=15&obj_id_lrs=339',
                                  attributes: [
                                    {
                                      key: 'title',
                                      value: 'Lernaufgaben Viren'
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
                  objectId: 'http://localhost:5173/goto.php?target=st_68_90&client_id=default&obj_id_lrs=339',
                  attributes: [
                    {
                      key: 'title',
                      value: 'Abschluss'
                    },
                    {
                      key: 'contentPages',
                      value: [
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_69_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Lerntagebuch'
                            },
                            {
                              key: 'interactiveTasks',
                              value: [
                                {
                                  lcoType: 'ILIAS_INTERACTIVE_TASK',
                                  objectId:
                                    'http://localhost:5173/goto.php?target=pg_69_90&client_id=default&h5p_object_id=17&obj_id_lrs=339',
                                  attributes: [
                                    {
                                      key: 'title',
                                      value: 'Lerntagebuch'
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        {
                          lcoType: 'ILIAS_CONTENT_PAGE',
                          objectId: 'http://localhost:5173/goto.php?target=pg_70_90&client_id=default&obj_id_lrs=339',
                          attributes: [
                            {
                              key: 'title',
                              value: 'Abschlussbefragung'
                            },
                            {
                              key: 'interactiveTasks',
                              value: [
                                {
                                  lcoType: 'ILIAS_INTERACTIVE_TASK',
                                  objectId:
                                    'http://localhost:5173/goto.php?target=pg_70_90&client_id=default&h5p_object_id=10&obj_id_lrs=339',
                                  attributes: [
                                    {
                                      key: 'title',
                                      value: 'Abschlussbefragung'
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
              key: 'offline',
              value: false
            }
          ]
        }
      ]
    }
  ]
}
