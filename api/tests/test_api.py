import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from api import app
from models import CareerPlan, Milestone1, Milestone2, Milestone3, Milestone4, UserProfile
from datetime import datetime

# Create test client
client = TestClient(app)

class TestAPIEndpoints:
    """Comprehensive tests for all API endpoints"""
    
    def setup_method(self):
        """Setup test data"""
        self.test_username = "test@example.com"
        self.test_user_profile = UserProfile(
            username=self.test_username,
            interests_values="Technology and innovation",
            work_experience="Software engineer with 5 years experience",
            circumstances="Single, flexible schedule",
            skills="Python, JavaScript, React",
            goals="Become a senior engineer"
        )
        
        # Create mock career plan
        self.mock_plan = self._create_mock_career_plan()
    
    def _create_mock_career_plan(self):
        """Create a mock career plan for testing"""
        from models import (
            Milestone1Detail, Milestone2Detail, Milestone3Detail, Milestone4Detail
        )
        
        # Create milestone details
        milestone1_detail = Milestone1Detail(
            title="Foundation Phase",
            description="Build core skills",
            timeline_weeks=4,
            key_objectives=["Learn fundamentals", "Practice coding"],
            success_metrics=["Complete course", "Build project"],
            recommended_actions=["Take online course"],
            resources=[{"name": "Course", "url": "example.com", "type": "course"}],
            potential_challenges=["Time management"],
            last_updated=datetime.now().isoformat(),
            daily_tasks=["Code for 1 hour"],
            weekly_goals=["Complete module"],
            skill_focus=["Python"],
            networking_targets=["Local meetup"],
            immediate_tools=[{"name": "VS Code", "type": "IDE"}]
        )
        
        milestone2_detail = Milestone2Detail(
            title="Development Phase",
            description="Build projects",
            timeline_weeks=12,
            key_objectives=["Build portfolio"],
            success_metrics=["3 completed projects"],
            recommended_actions=["Start personal project"],
            resources=[],
            potential_challenges=["Project complexity"],
            last_updated=datetime.now().isoformat(),
            projects_to_complete=["Web app"],
            certifications_target=["AWS"],
            portfolio_items=["GitHub projects"],
            industry_research=["Tech trends"],
            mentor_connections=["Senior engineer"]
        )
        
        milestone3_detail = Milestone3Detail(
            title="Career Transition",
            description="Advance career",
            timeline_weeks=52,
            key_objectives=["Get promotion"],
            success_metrics=["Senior role"],
            recommended_actions=["Apply for positions"],
            resources=[],
            potential_challenges=["Competition"],
            last_updated=datetime.now().isoformat(),
            career_targets=["Senior Engineer"],
            salary_expectations={"min": 90000, "max": 120000},
            professional_network=["Industry contacts"],
            leadership_opportunities=["Team lead"],
            market_positioning=["Full-stack expert"]
        )
        
        milestone4_detail = Milestone4Detail(
            title="Long-term Vision",
            description="Leadership role",
            timeline_weeks=260,
            key_objectives=["Become tech lead"],
            success_metrics=["Management position"],
            recommended_actions=["Develop leadership skills"],
            resources=[],
            potential_challenges=["Management transition"],
            last_updated=datetime.now().isoformat(),
            vision_statement="Lead innovative tech teams",
            financial_goals={"salary": 150000, "equity": 50000},
            industry_impact=["Open source contributions"],
            mentorship_goals=["Mentor junior developers"],
            exit_strategies=["Start own company"],
            legacy_projects=["Platform that helps developers"]
        )
        
        # Create milestones
        milestone1 = Milestone1(
            milestone_id="1_month_test",
            title="Foundation Phase",
            overview="Build core skills",
            details=milestone1_detail
        )
        
        milestone2 = Milestone2(
            milestone_id="3_months_test",
            title="Development Phase", 
            overview="Build projects",
            details=milestone2_detail
        )
        
        milestone3 = Milestone3(
            milestone_id="1_year_test",
            title="Career Transition",
            overview="Advance career",
            details=milestone3_detail
        )
        
        milestone4 = Milestone4(
            milestone_id="5_years_test",
            title="Long-term Vision",
            overview="Leadership role",
            details=milestone4_detail
        )
        
        # Create career plan
        return CareerPlan(
            plan_id="test_plan_123",
            user_id=self.test_username,
            overview={
                "summary": "Career growth plan",
                "timeline": "5 years"
            },
            milestone_1=milestone1,
            milestone_2=milestone2,
            milestone_3=milestone3,
            milestone_4=milestone4,
            created_date=datetime.now().isoformat(),
            last_updated=datetime.now().isoformat(),
            version=1
        )
    
    def test_root_endpoint(self):
        """Test the root endpoint returns API information"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "features" in data
        assert "milestone_endpoints" in data
        assert "milestone_types" in data
        
        # Check milestone endpoints structure
        endpoints = data["milestone_endpoints"]
        assert "1_month" in endpoints
        assert "3_months" in endpoints
        assert "1_year" in endpoints
        assert "5_years" in endpoints
        assert "generic" in endpoints
        
        # Verify endpoints use username parameter
        assert "{username}" in endpoints["1_month"]
        assert "{username}" in endpoints["3_months"]
        assert "{username}" in endpoints["1_year"]
        assert "{username}" in endpoints["5_years"]
    
    @patch('api.getUserInformationFromDB')
    @patch('api.manager.generate_initial_plan')
    @patch('api.storeUserPlanInDB')
    def test_generate_plan_success(self, mock_store, mock_generate, mock_get_user):
        """Test successful plan generation"""
        # Setup mocks
        mock_get_user.return_value = self.test_user_profile
        mock_generate.return_value = self.mock_plan
        mock_store.return_value = None
        
        response = client.post(f"/api/v3/generate-plan/{self.test_username}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["user_id"] == self.test_username
        assert "milestone_1" in data
        assert "milestone_2" in data
        assert "milestone_3" in data
        assert "milestone_4" in data
        
        # Verify database functions were called
        mock_get_user.assert_called_once_with(self.test_username)
        mock_generate.assert_called_once_with(self.test_user_profile)
        mock_store.assert_called_once()
    
    @patch('api.getUserPlanFromDB')
    def test_generate_plan_existing_plan(self, mock_get_plan):
        """Test plan generation when plan already exists"""
        mock_get_plan.return_value = self.mock_plan
        
        response = client.post(f"/api/v3/generate-plan/{self.test_username}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["user_id"] == self.test_username
        mock_get_plan.assert_called_once_with(self.test_username)
    
    @patch('api.getUserInformationFromDB')
    def test_generate_plan_user_not_found(self, mock_get_user):
        """Test plan generation when user doesn't exist"""
        mock_get_user.return_value = None
        
        response = client.post(f"/api/v3/generate-plan/{self.test_username}")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    @patch('api.getUserPlanFromDB')
    def test_get_plan_success(self, mock_get_plan):
        """Test successful plan retrieval"""
        mock_get_plan.return_value = self.mock_plan
        
        response = client.get(f"/api/v3/plan/{self.test_username}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["user_id"] == self.test_username
        assert "milestone_1" in data
        mock_get_plan.assert_called_once_with(self.test_username)
    
    @patch('api.getUserPlanFromDB')
    def test_get_plan_not_found(self, mock_get_plan):
        """Test plan retrieval when plan doesn't exist"""
        mock_get_plan.return_value = None
        
        response = client.get(f"/api/v3/plan/{self.test_username}")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    @patch('api.getUserPlanFromDB')
    def test_get_milestone_1_success(self, mock_get_plan):
        """Test successful milestone 1 retrieval"""
        mock_get_plan.return_value = self.mock_plan
        
        response = client.get(f"/api/v3/milestone/1_month/{self.test_username}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["timeframe"] == "1_month"
        assert data["title"] == "Foundation Phase"
        assert "details" in data
        assert "daily_tasks" in data["details"]
        mock_get_plan.assert_called_once_with(self.test_username)
    
    @patch('api.getUserPlanFromDB')
    def test_get_milestone_2_success(self, mock_get_plan):
        """Test successful milestone 2 retrieval"""
        mock_get_plan.return_value = self.mock_plan
        
        response = client.get(f"/api/v3/milestone/3_months/{self.test_username}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["timeframe"] == "3_months"
        assert data["title"] == "Development Phase"
        assert "details" in data
        assert "projects_to_complete" in data["details"]
        mock_get_plan.assert_called_once_with(self.test_username)
    
    @patch('api.getUserPlanFromDB')
    def test_get_milestone_3_success(self, mock_get_plan):
        """Test successful milestone 3 retrieval"""
        mock_get_plan.return_value = self.mock_plan
        
        response = client.get(f"/api/v3/milestone/1_year/{self.test_username}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["timeframe"] == "1_year"
        assert data["title"] == "Career Transition"
        assert "details" in data
        assert "career_targets" in data["details"]
        mock_get_plan.assert_called_once_with(self.test_username)
    
    @patch('api.getUserPlanFromDB')
    def test_get_milestone_4_success(self, mock_get_plan):
        """Test successful milestone 4 retrieval"""
        mock_get_plan.return_value = self.mock_plan
        
        response = client.get(f"/api/v3/milestone/5_years/{self.test_username}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["timeframe"] == "5_years"
        assert data["title"] == "Long-term Vision"
        assert "details" in data
        assert "vision_statement" in data["details"]
        mock_get_plan.assert_called_once_with(self.test_username)
    
    @patch('api.getUserPlanFromDB')
    def test_get_milestone_plan_not_found(self, mock_get_plan):
        """Test milestone retrieval when plan doesn't exist"""
        mock_get_plan.return_value = None
        
        response = client.get(f"/api/v3/milestone/1_month/{self.test_username}")
        assert response.status_code == 404
        assert "plan not found" in response.json()["detail"].lower()
    
    @patch('api.getUserPlanFromDB')
    def test_get_milestone_milestone_not_found(self, mock_get_plan):
        """Test milestone retrieval when specific milestone doesn't exist"""
        plan_without_milestone = self.mock_plan.model_copy()
        plan_without_milestone.milestone_1 = None
        mock_get_plan.return_value = plan_without_milestone
        
        response = client.get(f"/api/v3/milestone/1_month/{self.test_username}")
        assert response.status_code == 404
        assert "milestone 1 not found" in response.json()["detail"].lower()
    
    @patch('api.getUserPlanFromDB')
    def test_get_milestone_generic_endpoint(self, mock_get_plan):
        """Test generic milestone endpoint"""
        mock_get_plan.return_value = self.mock_plan
        
        response = client.get(f"/api/v3/milestone/1_month/{self.test_username}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["timeframe"] == "1_month"
        mock_get_plan.assert_called_once_with(self.test_username)
    
    @patch('api.getUserPlanFromDB')
    def test_get_milestone_invalid_timeframe(self, mock_get_plan):
        """Test generic milestone endpoint with invalid timeframe"""
        mock_get_plan.return_value = self.mock_plan
        
        response = client.get(f"/api/v3/milestone/invalid_time/{self.test_username}")
        assert response.status_code == 404
        assert "milestone not found" in response.json()["detail"].lower()
    
    def test_list_plans_placeholder(self):
        """Test list plans endpoint (currently returns placeholder)"""
        response = client.get("/api/v3/plans")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "total_plans" in data
        assert data["total_plans"] == 0
    
    def test_error_handling_invalid_endpoint(self):
        """Test error handling for invalid endpoints"""
        response = client.get("/api/v3/invalid-endpoint")
        assert response.status_code == 404
    
    def test_api_cors_headers(self):
        """Test that CORS headers are properly set"""
        response = client.options("/")
        # Should not fail due to CORS configuration
        assert response.status_code in [200, 405]  # 405 is acceptable for OPTIONS on GET endpoint
    
    @patch('api.getUserPlanFromDB')
    @patch('api.manager.process_user_thoughts_to_updates')
    @patch('api.manager.update_milestone_with_cascade')
    def test_update_milestone_with_cascade(self, mock_cascade, mock_process, mock_get_plan):
        """Test cascade update endpoint with natural language"""
        from models import MilestoneUpdate
        
        # Setup mocks
        mock_get_plan.return_value = self.mock_plan
        mock_update = MilestoneUpdate(
            objectives=["Updated objective"],
            timeline_weeks=8,
            user_notes="User wants to focus more on practical skills"
        )
        mock_process.return_value = mock_update
        
        updated_plan = self.mock_plan.model_copy()
        updated_plan.version = 2
        mock_cascade.return_value = updated_plan
        
        # Test request
        request_data = {
            "user_thoughts": "I want to focus more on practical coding skills and extend the timeline",
            "context": "Found the original timeline too aggressive"
        }
        
        response = client.put(
            f"/api/v3/milestone/1_month/{self.test_username}/update-cascade",
            json=request_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "updated_plan" in data
        assert "processed_updates" in data
        assert "cascade_affected" in data
        
        # Verify method calls
        mock_get_plan.assert_called_once_with(self.test_username)
        mock_process.assert_called_once_with(
            self.mock_plan, "1_month", request_data["user_thoughts"], request_data["context"]
        )
        mock_cascade.assert_called_once_with(self.mock_plan, "1_month", mock_update)
    
    @patch('api.getUserPlanFromDB')
    @patch('api.manager.update_milestone_with_cascade')
    def test_direct_milestone_update(self, mock_cascade, mock_get_plan):
        """Test direct milestone update endpoint"""
        from models import MilestoneUpdate
        
        # Setup mocks
        mock_get_plan.return_value = self.mock_plan
        updated_plan = self.mock_plan.model_copy()
        updated_plan.version = 2
        mock_cascade.return_value = updated_plan
        
        # Test request
        update_data = {
            "objectives": ["New objective 1", "New objective 2"],
            "timeline_weeks": 6,
            "focus_areas": ["Python", "Web Development"],
            "user_notes": "Direct update with structured data",
            "priority_level": "high"
        }
        
        response = client.put(
            f"/api/v3/milestone/3_months/{self.test_username}/direct-update",
            json=update_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "updated_plan" in data
        assert "applied_updates" in data
        assert "cascade_affected" in data
        
        # Verify cascade was called with correct parameters
        mock_cascade.assert_called_once()
        call_args = mock_cascade.call_args[0]
        assert call_args[0] == self.mock_plan
        assert call_args[1] == "3_months"
        assert isinstance(call_args[2], MilestoneUpdate)
    
    @patch('api.getUserPlanFromDB')
    @patch('api.manager.regenerate_subsequent_milestones')
    @patch('api.storeUserPlanInDB')
    def test_regenerate_subsequent_milestones(self, mock_store, mock_regenerate, mock_get_plan):
        """Test regenerate subsequent milestones endpoint"""
        # Setup mocks
        mock_get_plan.return_value = self.mock_plan
        updated_plan = self.mock_plan.model_copy()
        updated_plan.version = 2
        mock_regenerate.return_value = updated_plan
        mock_store.return_value = None
        
        # Test request
        request_data = {
            "updated_milestone": "1_month",
            "subsequent_milestones": ["3_months", "1_year"]
        }
        
        response = client.post(
            f"/api/v3/plan/{self.test_username}/regenerate-subsequent",
            params=request_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "updated_plan" in data
        assert "based_on" in data
        assert "regenerated_milestones" in data
        
        # Verify method calls
        mock_get_plan.assert_called_once_with(self.test_username)
        mock_regenerate.assert_called_once_with(
            self.mock_plan, "1_month", ["3_months", "1_year"]
        )
        mock_store.assert_called_once_with(updated_plan)
    
    @patch('api.getUserPlanFromDB')
    @patch('api.manager.process_user_thoughts_to_updates')
    def test_process_thoughts_endpoint(self, mock_process, mock_get_plan):
        """Test process user thoughts endpoint (preview only)"""
        from models import MilestoneUpdate
        
        # Setup mocks
        mock_get_plan.return_value = self.mock_plan
        mock_update = MilestoneUpdate(
            objectives=["Processed objective"],
            timeline_weeks=10,
            user_notes="Processed thoughts about timeline extension"
        )
        mock_process.return_value = mock_update
        
        # Test request
        request_data = {
            "user_thoughts": "I think the timeline is too aggressive, I need more time to learn",
            "context": "Beginner level, working part-time"
        }
        
        response = client.post(
            f"/api/v3/milestone/1_year/{self.test_username}/process-thoughts",
            json=request_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "timeframe" in data
        assert "user_thoughts" in data
        assert "processed_updates" in data
        assert "note" in data
        assert "not been applied" in data["note"]
        
        # Verify method calls
        mock_get_plan.assert_called_once_with(self.test_username)
        mock_process.assert_called_once_with(
            self.mock_plan, "1_year", request_data["user_thoughts"], request_data["context"]
        )
    
    def test_cascade_endpoints_invalid_timeframe(self):
        """Test cascade endpoints with invalid timeframes"""
        request_data = {
            "user_thoughts": "Test thoughts",
            "context": "Test context"
        }
        
        # Test invalid timeframe
        response = client.put(
            f"/api/v3/milestone/invalid_time/{self.test_username}/update-cascade",
            json=request_data
        )
        assert response.status_code == 400
        assert "Invalid timeframe" in response.json()["detail"]
    
    @patch('api.getUserPlanFromDB')
    def test_cascade_endpoints_no_plan(self, mock_get_plan):
        """Test cascade endpoints when no plan exists"""
        mock_get_plan.return_value = None
        
        request_data = {
            "user_thoughts": "Test thoughts",
            "context": "Test context"
        }
        
        response = client.put(
            f"/api/v3/milestone/1_month/{self.test_username}/update-cascade",
            json=request_data
        )
        assert response.status_code == 404
        assert "No plan found" in response.json()["detail"]
    
    def test_root_endpoint_includes_cascade_endpoints(self):
        """Test that root endpoint includes information about cascade endpoints"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        
        assert "cascade_endpoints" in data
        cascade_endpoints = data["cascade_endpoints"]
        
        assert "update_with_cascade" in cascade_endpoints
        assert "direct_update" in cascade_endpoints
        assert "regenerate_subsequent" in cascade_endpoints
        assert "process_thoughts" in cascade_endpoints
        
        # Check that endpoints contain the correct patterns
        assert "/update-cascade" in cascade_endpoints["update_with_cascade"]
        assert "/direct-update" in cascade_endpoints["direct_update"]
        assert "/regenerate-subsequent" in cascade_endpoints["regenerate_subsequent"]
        assert "/process-thoughts" in cascade_endpoints["process_thoughts"]


class TestAPIModels:
    """Test that API properly handles model validation"""
    
    def test_milestone_model_validation(self):
        """Test that milestone models validate correctly"""
        from models import Milestone1Detail, Milestone1
        
        # Valid milestone detail
        detail = Milestone1Detail(
            title="Test",
            description="Test desc",
            timeline_weeks=4,
            key_objectives=["obj1"],
            success_metrics=["metric1"],
            recommended_actions=["action1"],
            resources=[],
            potential_challenges=[],
            last_updated=datetime.now().isoformat(),
            daily_tasks=["task1"],
            weekly_goals=["goal1"],
            skill_focus=["skill1"],
            networking_targets=["target1"],
            immediate_tools=[]
        )
        
        milestone = Milestone1(
            milestone_id="test_id",
            title="Test Milestone",
            overview="Test overview",
            details=detail
        )
        
        # Should not raise validation errors
        assert milestone.timeframe == "1_month"
        assert milestone.title == "Test Milestone"
        assert len(milestone.details.daily_tasks) == 1
    
    def test_career_plan_model_validation(self):
        """Test that CareerPlan model validates correctly"""
        plan = CareerPlan(
            plan_id="test_plan",
            user_id="test@example.com",
            overview={"summary": "test"},
            milestone_1=None,
            milestone_2=None,
            milestone_3=None,
            milestone_4=None,
            created_date=datetime.now().isoformat(),
            last_updated=datetime.now().isoformat()
        )
        
        # Should not raise validation errors
        assert plan.user_id == "test@example.com"
        assert plan.milestone_1 is None
        assert plan.version == 1  # Default value


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])