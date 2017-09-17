'use strict';
/**
 * Write your transction processor functions here
 */


/**
 * Sample transaction
 * @param {hophack.network.ModPatient} modification
 * @transaction
 */
function onModPatient(modification) {
    var participantRegistry
    return getParticipantRegistry('hophack.network.Patient')
        .then(function(pr) {
            participantRegistry = pr
            return participantRegistry.get(modification.patientId)
        })
        .then(function(patient) {
            attr = modification.attribute
            if (!patient.hasOwnProperty(attr)) {
                throw new Error("no such attribute")
            }
            patient[attr] = modification.value
            return participantRegistry.update(patient)
        })
}


/**
 * Sample transaction
 * @param {hophack.network.DelDoctor} modification
 * @transaction
 */
function onDelDoctor(modification) {
    var participantRegistry
    return getParticipantRegistry('hophack.network.Doctor')
        .then(function(pr) {
            participantRegistry = pr
            return participantRegistry.get(modification.doctorId)
        })
        .then(function(doctor) {
            return participantRegistry.remove(doctor)
        })
}


/**
 * Sample transaction
 * @param {hophack.network.ModDoctorPatient} modification
 * @transaction
 */
function onModDoctorPatient(modification) {
    var participantRegistry
    return getParticipantRegistry('hophack.network.Doctor')
        .then(function(pr) {
            participantRegistry = pr
            return participantRegistry.get(modification.doctorId)
        })
        .then(function(doctor) {
      		var ps = modification.patients
            var success = []
            var fail = []
            getParticipantRegistry('hophack.network.Patient')
            .then(function(pr) {
				doctor.patients = []
				pr.getAll().then(function(allpatients) {
                  	var ids = []
                    for(var i = 0; i < allpatients.length; i++) {
                      	ids.push(allpatients[i].patientId)
                    }
					for (var i = 0; i < ps.length; i++) {
                      	p = ps[i]
						if (ids.includes(p.patientId)) {
							doctor.patients.push(p)
							success.push(p.patientId)
						} else {
							fail.push(p.patientId)
						}
					}
					res = {
						"success": success,
						"fail": fail
					}
                  	console.log(res)
					participantRegistry.update(doctor)
					return res
				})
            }, function(err){
                return err
            })
        })
}

/**
 * Sample transaction
 * @param {hophack.network.AddDoctor} info
 * @transaction
 */
function onAddDoctor(info) {
 	var factory = getFactory()
    var newDoctor = factory.newResource("hophack.network", "Doctor", info.doctorId)
	newDoctor.name = info.name
	newDoctor.position = info.position
	newDoctor.patients = info.patients || []
  	return getParticipantRegistry("hophack.network.Doctor")
  		.then(function(pr) {
      		return pr.add(newDoctor)
    	})
}