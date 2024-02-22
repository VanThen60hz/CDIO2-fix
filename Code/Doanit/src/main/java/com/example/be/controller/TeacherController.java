package com.example.be.controller;
import com.example.be.dto.AccountRoleDTO;
import com.example.be.dto.CreateUpdateTeacherDTO;
import com.example.be.dto.ITeacherDto;
import com.example.be.dto.ITeacherUpdateDTO;
import com.example.be.entity.Account;
import com.example.be.entity.AccountRole;
import com.example.be.entity.Degree;
import com.example.be.entity.Faculty;
import com.example.be.repository.IAccountRoleRepository;
import com.example.be.repository.IRoleRepository;
import com.example.be.service.IAccountService;
import com.example.be.service.IDegreeService;
import com.example.be.service.IFacultyService;
import com.example.be.service.ITeacherService;
import com.example.be.validate.TeacherValidator;
import com.example.be.validate.TeacherValidatorUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    @Autowired
    private ITeacherService teacherService;

    @Autowired
    private IAccountService accountService;

    @Autowired
    private TeacherValidator teacherValidator;

    @Autowired
    private TeacherValidatorUpdate teacherValidatorUpdate;

    @Autowired
    private IFacultyService facultyService;
    @Autowired
    private IDegreeService degreeService;

    @Autowired
    private IRoleRepository iRoleRepository;
    @Autowired
    private IAccountRoleRepository iAccountRoleRepository;

    @PreAuthorize("hasRole('ADMIN')" )
    @PostMapping("/createTeacher")
    public ResponseEntity<?> createTeacher(@RequestBody CreateUpdateTeacherDTO teacherDTO) {
        if (teacherDTO == null) {
            return new ResponseEntity<CreateUpdateTeacherDTO>(HttpStatus.BAD_REQUEST);
        } else {
            Map<String,String> errors  = teacherValidator.validate(teacherDTO);
            if (errors.isEmpty()) {
                Account account = new Account();
                account.setUsername(teacherDTO.getEmail());
                account.setPassword("$2a$10$mtsLRMKw9b6Cx54yFBXIAeViE36X8oq3KYM4Myj4phk2gIszxbQmy");                account = accountService.registerAccount(account);
                teacherDTO.setAccountId(account.getAccountId());

                iAccountRoleRepository.createAccountRole(teacherDTO.getAccountId(), 2);

                teacherService.createTeacher(teacherDTO);
                return new ResponseEntity<CreateUpdateTeacherDTO>(teacherDTO, HttpStatus.OK);
            } else {
                return new ResponseEntity<Map<String,String>>( errors, HttpStatus.BAD_REQUEST);
            }
        }
    }


    @GetMapping(value = "/getTeacherById/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ITeacherUpdateDTO> findStudentById(@PathVariable Integer id){
        ITeacherUpdateDTO teacher = teacherService.getTeacherById(id);
        if (teacher == null){
            return new ResponseEntity<ITeacherUpdateDTO>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<ITeacherUpdateDTO>(teacher, HttpStatus.OK);
    }


    @GetMapping(value = "/getAllFaculty")
    public ResponseEntity<List<Faculty>> getAllFaculty(){
        List<Faculty> faculties = facultyService.getAllFaculty();
        if (faculties.isEmpty()){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<List<Faculty>>(faculties, HttpStatus.OK);
    }


    @GetMapping(value = "/getAllDegree")
    public ResponseEntity<List<Degree>> getAllDegree(){
        List<Degree> degrees = degreeService.getAllDegree();
        if (degrees.isEmpty()){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<List<Degree>>(degrees, HttpStatus.OK);
    }


    @PreAuthorize("hasRole('ADMIN')" )
    @PostMapping("/updateTeacher")
    public ResponseEntity<?> updateTeacher(@RequestBody CreateUpdateTeacherDTO teacherDTO) {
        if (teacherService.getTeacherById(teacherDTO.getTeacherId()) == null) {
            return new ResponseEntity<>("không tìm thấy teacher",HttpStatus.BAD_REQUEST);
        } else {
            Map<String,String> errors  = teacherValidatorUpdate.validate(teacherDTO);
            if (errors.isEmpty()) {
                teacherService.updateTeacher(teacherDTO);
                return new ResponseEntity<CreateUpdateTeacherDTO>(teacherDTO, HttpStatus.OK);
            } else {
                return new ResponseEntity<Map<String,String>>( errors, HttpStatus.BAD_REQUEST);
            }
        }
    }

    @PreAuthorize("hasRole('ADMIN')" )
    @GetMapping("/list")
    public ResponseEntity<Page<ITeacherDto>> getAllTeacher(@RequestParam(defaultValue = "") String find,
                                                           @RequestParam(value = "page") Integer page){
        Page<ITeacherDto> listTeacher = teacherService.getAllTeacher(find, PageRequest.of(page,4));
        if (listTeacher.isEmpty()){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<Page<ITeacherDto>>(listTeacher, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')" )
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Integer id){
        teacherService.deleteTeacher(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
