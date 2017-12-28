var latkaApp = angular.module("latkaApp", ['ionic', 'ngCordova', 'ngRoute']);

var maali = false;
var langet = false;//piti tehdä länki laukaukselle apu muuttuja...

var liikutaNeulaaInterval = null;//setIntervalia varten...voi sit clearInterval
var neulan_arvo = null;//neulan arvo kun liikutellaan ja sit kun pysäytetään niin tästä se sen hetkinen leveys arvo...
var neulan_liikkumis_suunta = null;//true = myötäpäivään & false = vastapäivään...
var neulan_liikkumis_nopeus = 10;//millisekunnit setIntervalissa...pienempi arvo on nopeampi
var neulan_max_asteetVasen = -35;
var neulan_max_asteetOikea = 35;

var liikutaPystyPalkkiaInterval = null;//setIntervalia varten...voi sit clearInterval
var pystyPalkki_arvo = null;
var pystyPalkki_liikkumis_suunta = null;//true = alas & false = ylös...
var pystyPalkki_liikkumis_nopeus = 10;//millisekunnit setIntervalissa...pienempi arvo on nopeampi
var pystyPalkki_min = 97;
var pystyPalkki_max = 0;

var maali_aani = null;
var loppu_aani = null;

latkaApp.config(function($routeProvider) {//eri sivustot
    
    $routeProvider
            .when("/alkusivu", {
                templateUrl : "templates/alku.html"
            })
            .when("/peli", {
                templateUrl : "templates/peli.html"
            })
            .when("/loppu", {
                templateUrl : "templates/loppu.html"
            })
            .when("/jaapisteet", {
                templateUrl : "templates/jaapisteet.html"
            })
            .otherwise({
                templateUrl : "templates/alku.html"
            });
            
});

latkaApp.controller("latkaAppCtrl", function ($scope, $ionicPlatform, $window, $http, $cordovaMedia) {
    
    $ionicPlatform.ready(function() {
        //ääni sorsat
        maali_aani = $cordovaMedia.newMedia("/android_asset/www/sounds/maali.mp3");
        loppu_aani = $cordovaMedia.newMedia("/android_asset/www/sounds/loppu.mp3");

        $scope.maalit = 0;
        
        $scope.liikutaNeulaa_bool = true;
        
        
    });//platform.ready
    
    $scope.pysaytaNeula = function () {//functio neulan pysäytystä varten
        
        if ($scope.liikutaNeulaa_bool) {
            $scope.liikutaNeulaa_bool = false;
        } else {
            $scope.liikutaPystyPalkkia_bool = false;
        }
        
    };//pysayta()
    
    function liikutaNeulaa() {
        
        maali = false;
        
        if ($scope.liikutaNeulaa_bool) {
            var a = null;

            if (neulan_arvo === neulan_max_asteetOikea) {
                neulan_liikkumis_suunta = true;
            }
            if(neulan_arvo === neulan_max_asteetVasen) {
                neulan_liikkumis_suunta = false;
            }
            if (neulan_liikkumis_suunta) {
                a = -1;
            }
            if (!neulan_liikkumis_suunta) {
                a = 1;
            }
            
            neulan_arvo += a;
            
            $scope.munTyyli = {
                            "-ms-transform" : "rotate("+(neulan_arvo)+"deg)", 
                            "-webkit-transform" : "rotate("+(neulan_arvo)+"deg)", 
                            "transform" : "rotate("+(neulan_arvo)+"deg)"
                          };
            $scope.$apply();//tarvii tän... ei muuten paljo nuoli heilu

        }
        else {//kun neula on pysäytetty niin tänne koodit mitä sitten tehdään...
            
            clearInterval(liikutaNeulaaInterval);//pois interval ettei jää turhaa taustalle jauhamaan
            
            //tehdään "mielikuvitus" maali alueet... eli millä arvoilla kiekko menee maaliin vaakatasossa...
            //kokonaisuudessaan "laukomis" alue on noittein neulan maxVasen ja maxOikean välillä eli -45 ja 45 välissä... eli kokonaisuus alue 90 ellei sitten haluta noita max ja min muutella...
            
            //vasen maalialue vaakatasossa
            if (neulan_arvo >= -25 && neulan_arvo <= -10) {
                maali = true;
                langet = false;
            }
            
            //oikea maalialue vaakatasossa
            if (neulan_arvo <= 25 && neulan_arvo >= 10) {
                maali = true;
                langet = false;
            }
            
            //länget...jos ei tehdä pysty nuolihommaa niin tää pois...muuten liian helppo
            if (neulan_arvo <= 5 && neulan_arvo >= -5) {
                
                langet = true;
                maali = true;
            }
            
            $scope.liikutaPystyPalkkia_bool = true;
            
            liikutaPystyPalkkiaInterval = setInterval(liikutaPystyPalkkia, pystyPalkki_liikkumis_nopeus);

        }
        
    }//liikutaNeulaa
    
    function liikutaPystyPalkkia() {
        
        if ($scope.liikutaPystyPalkkia_bool) {
            var a = null;

            if (pystyPalkki_arvo === pystyPalkki_min) {
                pystyPalkki_liikkumis_suunta = true;
            }
            if(pystyPalkki_arvo === pystyPalkki_max) {
                pystyPalkki_liikkumis_suunta = false;
            }
            if (pystyPalkki_liikkumis_suunta) {
                a = -1;
            }
            if (!pystyPalkki_liikkumis_suunta) {
                a = 1;
            }
            
            pystyPalkki_arvo += a;
            
            $scope.pystyPalkki = { 
                                "top" : pystyPalkki_arvo + "%"
                                };
            $scope.$apply();
        }
        else {//kun pystypalkki on pysäytetty niin tänne koodit mitä sitten tehdään...
            
            clearInterval(liikutaPystyPalkkiaInterval);//pois interval ettei jää turhaa taustalle jauhamaan
            
            //tehdään "mielikuvitus" maali alueet... eli millä arvoilla kiekko menee maaliin pystytasossa...
            //kokonaisuudessaan "laukomis" alue on noittein neulan max ja max välillä eli 0 (ylin asento) ja 97 (alin asento) välissä (liikkuvan laatikon koko 3% joten liikkumisalue 97% korkeudesta)... eli kokonaisuus alue 97 ellei sitten haluta noita max ja min muutella...

            //ylä maalialue pystysuunnassa
            if (pystyPalkki_arvo >= 15 && pystyPalkki_arvo <= 40 && !langet) {
                if (maali){
                    maali = true;
                }
                else {
                    maali = false;
                }
            }//if
            
            //ala maalialue pystytasossa
            else if (pystyPalkki_arvo <= 80 && pystyPalkki_arvo >= 55 && !langet) {
                if (maali){
                    maali = true;
                }
                else {
                    maali = false;
                }
            }//else if
            
            //länget...jos ei tehdä pysty nuolihommaa niin tää pois...muuten liian helppo
            else if (pystyPalkki_arvo <= 97 && pystyPalkki_arvo >= 87 && langet) {
                if (maali){
                    maali = true;
                }
                else {
                    maali = false;
                }
            }//else if
            else {
                maali = false;
                langet = false;
            }
            
            //tähän koodit jos tulee maali
            
            if (maali) {
                
                langet = false;
                $scope.viesti = "Maali!";
                
                maali_aani.play().then(function () {
                    
                    $scope.viesti = "";
                    $scope.maalit += 1;
                    $scope.liikutaNeulaa_bool = true;
                    neulan_arvo = 0;
                    pystyPalkki_arvo = 0;
                    $scope.pystyPalkki = { 
                                        "top" : pystyPalkki_arvo + "%"
                                        };
                    liikutaNeulaaInterval = setInterval(liikutaNeulaa, neulan_liikkumis_nopeus);  
                    
                });//maali_aani.play
                
                
            }//if
            else {//tänne jos ei tule maalia ja peli loppuu
                
                $scope.viesti = "Ei maalia!";
                
                loppu_aani.play().then(function () {
                    
                    $scope.viesti = "";
                    $window.location.href = "#/loppu";
                    
                });
            }//else
        }//ylin else
    }//liikutaPystyPalkkia()
    
    $scope.nimi = {};
    
    $scope.lisaaKantaanPisteetNimi=function() {
        $http({
            method : "PUT",
            url : "http://192.168.1.84/ws/latkapeli.php",
            data : {nimi : $scope.nimi.teksti, pisteet : $scope.maalit}
            }).then(function () {//siirrytäämpä etusivulle
                    
                    alert("Olet onnistuneesti jakanut pisteesi.");//ei ammattitaitoisin vaihtoehto, mutta ionicPopup ei vaan millään toiminut. Ei pysty injektoimaan jostain syystä sitä vaan tulee erroria. Eikä aikaa tehdä uutta systeemiä.
                    $scope.maalit = 0;
                    pystyPalkki_arvo = 0;
                    neulan_arvo = 0;
                    $scope.pystyPalkki = { 
                                        "top" : pystyPalkki_arvo + "%"
                                        };
                    $scope.liikutaNeulaa_bool = true;
                    $window.location.href = "#/alku";
 
                }
                , 
                function (response) { //jos tulee virhe niin ilmottaa jotain syyksi
                console.log(response);
                var virhekoodi = response.status;
                    alert("Yhteysvirhe. Palvelimellle ei saatu yhteyttä. (" + virhekoodi + ")"
                    );
                });
    };//lisaaKantaanPisteetNimi()
    $scope.jaaPisteet = function () {
        
        $window.location.href = "#/jaapisteet";
        
    };//aloitaUusipeli
    $scope.aloitaUusipeli = function () {
        
        $scope.maalit = 0;
        pystyPalkki_arvo = 0;
        neulan_arvo = 0;
        $scope.pystyPalkki = { 
                            "top" : pystyPalkki_arvo + "%"
                            };
        $scope.liikutaNeulaa_bool = true;
        liikutaNeulaaInterval = setInterval(liikutaNeulaa, neulan_liikkumis_nopeus);
        $window.location.href = "#/peli";
        
    };//aloitaUusipeli
    
    
});//pCtrl