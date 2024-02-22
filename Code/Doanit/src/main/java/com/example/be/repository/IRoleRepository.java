package com.example.be.repository;

import com.example.be.entity.Role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IRoleRepository extends JpaRepository<Role,Integer> {
    Role findByRoleName(String roleName);

    @Query("SELECT r FROM Role r WHERE r.roleId = :id")
    Role findRoleByRoleId(@Param("id") Integer roleId);
}
